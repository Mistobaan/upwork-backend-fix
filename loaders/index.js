const express = require('./express')
const mongoose = require('./mongoose')

async function load(app){

    await express.loadExpress(app)

    await mongoose()
}

module.exports = load
