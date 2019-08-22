var dns = require('dns');
var psl = require('psl');
var IP = require('./ip').IP;
var ipService = require('./services/ip').IPApi
var botService = require('./services/bot').BotAPI;
const eventEmitter = require('events');
class LimiterEventEmitter extends eventEmitter { }
var limiterEventEmitter = new LimiterEventEmitter();

class Limiter {
    constructor(windowMs, max, dailyLimit, monitor, db) {
        this.windowTime = windowMs;
        this.windowMaxHit = max;
        this.dailyLimit = dailyLimit;
        this.ips = {};
        this.bots = {};
        this.monitor = monitor;
        this._ipsUnderReverseDNS = [];
        this.services = {
            ip : new ipService(db),
            botService : new botService(db)
        }
    }

    /**
     * @param {string} ipAddress
     * @return {boolean}
     */
    isReverseDNSLookupGoingOn(ip) {
        return this._ipsUnderReverseDNS.includes(ip);
    }
    /**
     * @param {string} ipAddress
     */
    addToReverseDNSLookupList(ip) {
        this._ipsUnderReverseDNS.push(ip)
    }

    /**
     * @param {string} ipAddress
     */
    removeFromReverseDNSLookupList(ip) {
        this._ipsUnderReverseDNS.splice(this._ipsUnderReverseDNS.indexOf(ip), 1)
    }

    /**
     * @param {string} ipAddress
     */
    reverseDNSLookup(ip) {
        this.addToReverseDNSLookupList(ip);
        return new Promise((resolve, reject) => {
            dns.lookupService(ip, 22, (err, hostname, service) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(psl.parse(hostname).domain);
                }
                this.removeFromReverseDNSLookupList(ip);
            })
        })
    }
    /**
     * @param {string} ipAddress
     * @return {IP}
     */
    addBlack(ipAddress) {
        this.ips[ipAddress] = new IP(ipAddress, true)
        return this.ips[ipAddress];
    }
    /**
     * @param {string} ipAddress
     */
    addWhite(ipAddress) {
        this.ips[ipAddress] = new IP(ipAddress, false)
        return this.ips[ipAddress];
    }
    /** 
    * @param {string} ipAddress
    */
    getIp(ipAddress) {
        return this.ips[ipAddress];
    }

    addBot(bot) {
        this.bots[bot.id] = bot;
    }

    getAllBots() {
        return Object.values(this.bots);
    }

    isBot(hostname) {
        return this.getAllBots().find(bot => {
            return bot.nameServers.includes(hostname)
        })
    }

    gateWay(req, res, next) {

        if (this.isLimitExceeded(req.ip)) {
            var ipInstance = this.getIp(req.ip);
            // ip already known to limiter
            if (ipInstance) {
                this.handle(req, res, next, ipInstance)
            } else if (this.isReverseDNSLookupGoingOn(req.ip)) { //reverse DNS lookup going on
                limiterEventEmitter.on(`${req.ip}_reversedns_lookup_over`, () => {
                    ipInstance = this.getIp(req.ip);
                    this.handle(req, res, next, ipInstance)
                })
            } else { //need reverse DNS look up
                this.reverseDNSLookup(req.ip).then(host => {
                    var bot;
                    // TRUE [ ADD to whitelist ] ,[ return true ]
                    if (bot = (this.isBot(host))) {
                        ipInstance = this.addWhite(req.ip);
                        bot.addDynamicIP(req.ip);
                        this.handle(req, res, next, ipInstance)
                    } else {
                        ipInstance = this.addBlack(req.ip);
                        this.handle(req, res, next, ipInstance)
                    }
                    limiterEventEmitter.emit(`${req.ip}_reversedns_lookup_over`)
                }).catch(err => {
                    if (err) {
                        ipInstance = this.addBlack(req.ip);
                        this.handle(req, res, next, ipInstance)
                    }
                })
            }
        } else {
            next();
        }
    }

    handle(req, res, next, ipInstance) {
        if (ipInstance.isBlack) {
            ipInstance.incrementCount();
            console.log(`${ipInstance.exceedCountOfTheDay} and ${this.dailyLimit * this.windowMaxHit}`);
            if (ipInstance.exceedCountOfTheDay > this.dailyLimit * this.windowMaxHit) {
                console.log('501')
                res.send(501);
            } else {
                // console.log('CAPTCHA');
                res.send('google captcha evaluation');
            }
        } else {
            next();
        }
    }

    isLimitExceeded(ip) {
        return this.monitor.ips[ip].hit > this.windowMaxHit
    }
}
module.exports = {
    Limiter: Limiter
}