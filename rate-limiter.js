const express = require('express')
const MongoClient = require('mongodb').MongoClient;
var app = express();
const burstLimit = 5;
const dailyLimit = 3;
const Limiter = require('./limiter').Limiter;
const monitor = require('./monitor');
var limiter = new Limiter(500, burstLimit, dailyLimit, monitor)

const serverIP = "127.0.0.1";
const serverPORT = "8080";


const dbUrl = 'mongodb://localhost:27017/testdb';
MongoClient.connect(dbUrl, { useNewUrlParser: true }).then(function( client) {
  _db = client.db('testdb');

  var mongoReqs = [];
  mongoReqs.push(_db.collection("bots").find({}).toArray())
  mongoReqs.push(_db.collection("ips").find({}).toArray());
  Promise.all(mongoReqs).then(results => {
    console.log(results);
  })


}).catch(err => {
  console.log(err)
});

app.use(monitor.middleware);
app.use(limiter.gateWay);

app.get('/*', function (req, res) {
  var endTime = new Date();
  console.log(`${req.connection.remoteAddress}`)
  res.send('Hello, I am a nice guy, I hope you dont bully me :) ');
  console.log('-----------------------------------------------------')
})

app.listen(serverPORT, serverIP, function (err) {
  if (err) throw err;
  console.log(`Service Listening at ${serverIP}:${serverPORT}`)
})

