var chai = require('../libs/chai/chai');
var expect = chai.expect;
var Bot = require('../bot').Bot;

describe('BOT', () => {
    it('should create bot instances', () => {
        var knownIp = "127.0.0.103"
        var bot = new Bot({
            "id" : "google",
            "ipList" : {
                "knownIPList" : [knownIp],
                "dynamicIPList" : []
            },
            "isNameServerCheckRequired" : true,
            "nameServers" : ["google.com", "googlebot.com"],
            "userAgents" : ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"]
        })

        expect(bot.isIPexist(knownIp)).to.be.true;

        var newKnownIp = "192.168.1.0";
        expect(bot.isIPexist(newKnownIp)).to.be.false;
        bot.addKnownIP(newKnownIp);
        expect(bot.isIPexist(newKnownIp)).to.be.true;

        var newDynamicIp = "222.222.222.222";
        expect(bot.isIPexist(newDynamicIp)).to.be.false;
        bot.addDynamicIP(newDynamicIp);
        expect(bot.isIPexist(newDynamicIp)).to.be.true;
    

    });
})
