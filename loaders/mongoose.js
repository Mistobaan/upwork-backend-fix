const mongoose = require('mongoose')
const config = require('../config')

const mongooseConnection = async () =>{
    try{
        await mongoose.connect(config.dbhost,{ useNewUrlParser: true,useUnifiedTopology: true, useCreateIndex: true , useFindAndModify: false})
    } catch(err){
        console.error(`DB connection error:\n ${err}`)
        process.exit(1)
    }
}

module.exports = mongooseConnection
