const mongoose = require('mongoose')
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const schema = new mongoose.Schema({
    customerID:{
        required: true,
        unique: true,
        type: Long
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        unique:true,
        required: true
    },
    extraContacts:[
        {
            name:String,
            phone: String
        }
    ],
    location:{
        street: {
            type:String,
            required: true
        },
        city: {
            type:String,
            required: true
        },
        notes:String,
        zipcode: Long
    },
    dateJoin: {
        type:Date,
        required:false,
        default:Date.now
    }
},{collection:'customers'})

const Model = mongoose.model('Customer',schema)
module.exports = Model
