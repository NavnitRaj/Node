// const { Sequelize, Model, DataTypes } = require("sequelize");

// const sequelize = new Sequelize('node-complete', 'root', 'root', {dialect: 'mysql', host: 'localhost'});

// module.exports = sequelize;

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db;
const uri = "mongodb://navnit_raj:lueZyC7reOIwz5KL@cluster0-shard-00-00.1lk5e.mongodb.net:27017,cluster0-shard-00-01.1lk5e.mongodb.net:27017,cluster0-shard-00-02.1lk5e.mongodb.net:27017/shop?ssl=true&replicaSet=atlas-ylyss9-shard-0&authSource=admin&retryWrites=true&w=majority";
const mongoConnect = callback => {
    MongoClient.connect(uri)
    .then(client => {
        _db = client.db();
        callback();
    })
    .catch(err=>{
        console.log(err)
    });
};
const getDb = () => {
    if(_db) return _db
    throw "no db"
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;