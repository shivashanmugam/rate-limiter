var chai = require('../libs/chai/chai');
var spies = require('../libs/chai/chai-spies');
chai.use(spies);
var expect = chai.expect;
var monitor = require('../monitor');


describe('monitor', () => {
    it('should test monitor', (done) => {
        var next = function () { };
        nextSpy = chai.spy(next);
        monitor.middleware({ ip: "127.0.0.1" }, {}, nextSpy);
        expect(nextSpy).to.have.been.called();
        expect(monitor.ips["127.0.0.1"].hit).to.equal(1);
        monitor.middleware({ ip: "127.0.0.1" }, {}, function () { });
        monitor.middleware({ ip: "127.0.0.1" }, {}, function () { });
        monitor.middleware({ ip: "127.0.0.1" }, {}, function () { });
        expect(monitor.ips["127.0.0.1"].hit).to.equal(4);

        setTimeout(function () {
            expect(monitor.ips["127.0.0.1"].hit).to.equal(4);
        }, 100)

        setTimeout(function () {
            expect(monitor.ips["127.0.0.1"]).to.be.undefined
            done();
        }, 500)
    });
})
