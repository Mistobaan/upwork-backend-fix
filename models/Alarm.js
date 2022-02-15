const mongoose = require('mongoose')
const {Schema} = require("mongoose");

const schema = new mongoose.Schema({
    kind:{
       required:true,
       type:String,
       enum:['fire','co','gas','power','panic','sos','tamper']
    },
    zone:{
       type:Number,
       required:true
    },
    locationName:{
       type:String
    },
    origin:{
       type:String,
       required:true
    },
    timestamp:{
       type:Date,
       default:Date.now
    },
    fatherPanel:Schema.Types.Mixed,
    customer:Schema.Types.Mixed,
    property: Schema.Types.Mixed,
    status:{
       type:String,
       enum:['new','work','dismiss'],
       default:'new'
    },
    statusHistory:[{
        _id: false,
       status:{
           type:String,
           enum:['new','work','dismiss']
       },
       comment:String,
       date:{
           type:Date,
           default:Date.now()
       },
       initiator:{
           type:mongoose.Schema.Types.ObjectId,
           ref:'User'
       }
    }]
},{collection:'alarms'})

const Model = mongoose.model('Alarms',schema)
module.exports = Model
