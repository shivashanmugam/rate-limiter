class Bot {
    constructor(bot) {
        Object.assign(this, bot);
    }
    /**
     * @param {IP} ip
     */
    addKnownIP(ip) {
        this.ipList.knownIPList.push(ip)
    }
    /**
     * @param {IP} ip
     */
    addDynamicIP(ip) {
        this.ipList.dynamicIPList.push(ip)
    }

    addNameServer(nameServer) {
        this.nameServers.push(nameServer);
    }

    addUserAgent(userAgent) {
        this.userAgents.push(userAgent)
    }

    /**
     * @param {string} ip
     * @returns {boolean}
     */
    isIPexist(ip) {
        return this.ipList.knownIPList.includes(ip) || this.ipList.dynamicIPList.includes(ip)
    }
}

module.exports = {
    Bot : Bot
}