const mongoose = require('mongoose')
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const schema = new mongoose.Schema({
    contacts: [{
        name:String,
        phone:String
    }],
    type:{
        required:true,
        type:String,
        enum:['apartment','ground-house','storeroom']
    },
    location:{
        street: {
            type:String,
            required: true
        },
        houseNum:{
            type:Number,
            required:true
        },
        aptNum:{
            type:Number
        },
        floor:{
            type:Number
        },
        city: {
            type:String,
            required: true
        },
        notes:String,
        zipcode: Long,
        geoLocation:{
            lat: {
                type:Number,
                required:true
            },
            lng: {
                type:Number,
                required: true
            }
        }
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    dateAdded:{
        type:Date,
        default:Date.now
    }
},{collection:'properties'})

const Model = mongoose.model('Property',schema)
module.exports = Model
