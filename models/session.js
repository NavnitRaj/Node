const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    _id:{
        type: String
    }
})

module.exports = mongoose.model('Session', sessionSchema);