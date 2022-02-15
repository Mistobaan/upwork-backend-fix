
const mongoose = require('mongoose')
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const schema = new mongoose.Schema({
    property:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    simNumber:{
        type:String,
        required:true
    },
    initStatus:{
        type:Boolean,
        default:false
    },
    initNumbers:[{
        type:String
    }],
    init_date:{
        default:Date.now,
        type:Date
    },
    initBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    devices:{
        type:{
        name:String,
        deviceType:{
            type: String,
            enum:['fire','co','gas']
        },
        zone:{
            type:Number
        }
    }},
    deviceCount:Number,
    powerStatus: {
        default: true,
        type: Boolean
    }
},{collection:'panels'})

const Model = mongoose.model('Panel',schema)
module.exports = Model
