
class IP {
    /** 
    * @param {string} ip
    * @param {boolean} isBlack
    * @returns {BlackList || null}
    */
    constructor(ip, isBlack,ipService) {
        if (typeof ip == "object") {
            Object.assign(this, ip);
        } else {
            this.ip = ip;
            this.isBlack = isBlack;
            this.addedOn = new Date().toISOString();
            this.exceedCountOfTheDay = 1;
            this.exceedCountTotal = 1;
            ipService.insert(this)
        }
    }

    incrementCount(){
        this.exceedCountOfTheDay++;
        this.exceedCountTotal++;
    }
}

module.exports = {
    IP : IP
}

