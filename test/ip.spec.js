var chai = require('../libs/chai/chai');
var expect = chai.expect;
var IP = require('../ip').IP;

describe('IP', () => {
    it('should create ip instances', () => {
        const ip1 = new IP("127.0.0.1", false);
        const ip2 = new IP({
            "ip": "127.0.0.2",
            "isBlack": true,
            "addedOn": "2019-08-17T02:21:17.334Z",
            "exceedCountOfTheDay": 10,
            "exceedCountTotal": 20

        });

        expect(ip1.exceedCountOfTheDay).to.equal(1);
        expect(ip1.exceedCountTotal).to.equal(1);
        expect(ip1.isBlack).to.equal(false);


        expect(ip2.exceedCountOfTheDay).to.equal(10);
        expect(ip2.exceedCountTotal).to.equal(20);
        expect(ip2.isBlack).to.equal(true);

        ip1.incrementCount();
        expect(ip1.exceedCountOfTheDay).to.equal(2);
        expect(ip1.exceedCountTotal).to.equal(2);


    });
})
