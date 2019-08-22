var chai = require('../libs/chai/chai');
var spies = require('../libs/chai/chai-spies');
chai.use(spies);
var expect = chai.expect;
var Limiter = require('../limiter').Limiter;
var monitor = require('../monitor')
var Bot = require('../bot').Bot;


describe('Limiter', () => {
    it('should test Limiter with whitlist', (done) => {
        var burstLimit = 5;
        var dailyLimit = 3;
        var limiter = new Limiter(500, burstLimit, dailyLimit, monitor)
        var bot = new Bot({
            "id": "google",
            "ipList": {
                "knownIPList": ["111.111.111.111", "222.222.222.222"],
                "dynamicIPList": []
            },
            "isNameServerCheckRequired": true,
            "nameServers": ["google.com", "googlebot.com"],
            "userAgents": ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"]
        })
        limiter.addBot(bot);

        var next, nextSpy;

        // EXCEEDING BURST LIMIT
        for (var i = 0; i < burstLimit + 2; i++) {
            next = function () { };
            nextSpy = chai.spy(next);
            monitor.middleware({ ip: "222.222.222.222" }, {}, function () { });
            limiter.gateWay({ ip: "222.222.222.222" }, {}, nextSpy);
            expect(nextSpy).to.have.been.called();
        }


        for (var i = 0; i < burstLimit + 2; i++) {
            next = function () { };
            nextSpy = chai.spy(next);
            monitor.middleware({ ip: "66.249.66.1" }, {}, function () { });
            limiter.gateWay({ ip: "66.249.66.1" }, {}, nextSpy);
            setTimeout(function () {
                expect(nextSpy).to.have.been.called();
                done();
            }, 1500)
        }

    });

    it('should test Limiter with blacklist with response of google recaptcha evaluation', function (done) {

        this.timeout(10000);

        var burstLimit = 5;
        var dailyLimit = 3;
        var limiter = new Limiter(500, burstLimit, dailyLimit, monitor)
        var bot = new Bot({
            "id": "google",
            "ipList": {
                "knownIPList": ["111.111.111.111", "222.222.222.222"],
                "dynamicIPList": []
            },
            "isNameServerCheckRequired": true,
            "nameServers": ["google.com", "googlebot.com"],
            "userAgents": ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"]
        })
        limiter.addBot(bot);

        var next, nextSpy, resSend, resSendSpy;

        // EXCEEDING BURST LIMIT
        for (var i = 0; i < burstLimit + 2; i++) {
            monitor.middleware({ ip: "150.150.150.150" }, {}, function () { });
        }
        next = function () { };
        resSend = function (data) { };
        resSendSpy = chai.spy(resSend);
        nextSpy = chai.spy(next);
        limiter.gateWay({ ip: "150.150.150.150" }, { send: resSendSpy }, nextSpy);

        setTimeout(function () {
            expect(nextSpy).not.to.have.been.called();
            expect(resSendSpy).to.have.been.called.with("google captcha evaluation");
            done();
        }, 5000)
    });

    // it('should test Limiter with blacklist with response of 501', function (done) {

    //     this.timeout(20000);

    //     var burstLimit = 5;
    //     var dailyLimit = 3;
    //     var limiter = new Limiter(500, burstLimit, dailyLimit, monitor)
    //     var bot = new Bot({
    //         "id": "google",
    //         "ipList": {
    //             "knownIPList": ["111.111.111.111", "222.222.222.222"],
    //             "dynamicIPList": []
    //         },
    //         "isNameServerCheckRequired": true,
    //         "nameServers": ["google.com", "googlebot.com"],
    //         "userAgents": ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"]
    //     })
    //     limiter.addBot(bot);

    //     var next, nextSpy, resSend, resSendSpy;

    //     // EXCEEDING BURST LIMIT
    //     for (var j = 1; j < dailyLimit + 2; j++) {
    //         var timeOut = j * 1000;
    //         setTimeout(function(){
    //             for (var i = 0; i < burstLimit + 2; i++) {
    //                 monitor.middleware({ ip: "150.150.150.150" }, {}, function () { });
    //                 limiter.gateWay({ ip: "150.150.150.150" }, { send: function(){} }, function(){});
    //             }
    //         }, timeOut)
    //         // setTimeout(function () {
    //         //     next = function () { };
    //         //     resSend = function (data) { };
    //         //     resSendSpy = chai.spy(resSend);
    //         //     nextSpy = chai.spy(next);
    //         //     limiter.gateWay({ ip: "150.150.150.150" }, { send: resSendSpy }, nextSpy);
    //         //     expect(nextSpy).not.to.have.been.called();
    //         //     expect(resSendSpy).to.have.been.called.with(501);
    //         //     done();
    //         // }, 3100)
    //     }


    // });


})
