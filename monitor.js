monitor = {
    middleware : function (req, res, next) {
        this.addIP(req.ip);
        this.incrementHit(req.ip);
        next();
        this.clearOutAfterWindow(req.ip);
    },
    addIP : function(ip){
        if (!this.ips[ip]) {
            this.ips[ip] = {
                hit: 0
            }
        }
    },
    incrementHit(ip){
        this.ips[ip].hit++;
    },
    decrementHit(ip){
        this.ips[ip].hit--;
    },
    clearOutAfterWindow(ip){
        setTimeout(function () {
            this.decrementHit(ip);
            if (this.ips[ip].hit == 0) {
                this.removeIP(ip);
            }
        }.bind(this), this.windowTime)
    },
    removeIP(ip){
        delete this.ips[ip];
    },
    ips : {},
    windowTime : 500 //500 is currently default
} 


module.exports = {
    ips : monitor.ips,
    middleware : monitor.middleware.bind(monitor),
    removeIP : monitor.removeIP.bind(monitor)
}