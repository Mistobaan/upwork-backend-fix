const mongoose = require('mongoose')
const usersConfig = require('../config/index').users

const usersRoles = usersConfig.userRoles.map(selector=>selector.role)

const schema = new mongoose.Schema({
    _id:String,
    phones:{
        phone1: {
            type:String,
            required:true
        },
        phone2:String,
        phone3:String
    }
},{
    collection:'general',
    _id:false,
    strict:false
})

const Model = mongoose.model('General',schema)
module.exports = Model
