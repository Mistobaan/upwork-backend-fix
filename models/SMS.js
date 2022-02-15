const mongoose = require('mongoose')

const schema = new mongoose.Schema({
   any:{} 
},{collection:'SMS',strict: false })

const Model = mongoose.model('SMS',schema)
module.exports = Model
