class BotAPI {
    constructor(db){
        this.db = db;
    }

    getAll(){
        return this.db.collection("bots").find({}).toArray()
    }
    
}

module.exports = {
    BotAPI : BotAPI
}