const mongoose = require('mongoose')
const usersConfig = require('../config/index').users

const usersRoles = usersConfig.userRoles.map(selector=>selector.role)

const schema = new mongoose.Schema({
    name:String,
    email:{
        required:true,
        unique:true,
        type:String
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        required:true,
        type:String
    },
    role:{
        enum:usersRoles,
        type:String,
        default:usersRoles[-1]
    },
    root:{
        type:Boolean,
        default:false
    },
    dateJoin:{
        type:Date,
        default:Date.now
    }
},{collection:'users'})

const Model = mongoose.model('User',schema)
module.exports = Model
