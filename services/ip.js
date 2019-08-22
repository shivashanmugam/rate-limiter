class IPApi {
    constructor(db){
        this.db = db;
    }

    insert(ipObj){
        return this.db.collection("ips").insert(ipObj)
    }

    getAll(){
        return this.db.collection("ips").find({}).toArray()
    }
    
}

module.exports = {
    IPApi : IPApi
}