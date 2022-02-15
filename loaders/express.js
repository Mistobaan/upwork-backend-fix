const express = require('express')
const cors = require('cors')
const routes = require('../api-routes')
const morgan = require('morgan')
const config = require('../config')

async function loadExpress(app){
    app.get('/status', (req, res) => { res.status(200).end(); });
    app.head('/status', (req, res) => { res.status(200).end(); });
    app.enable('trust proxy');

    app.use(cors());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(config.api.prefix,routes());
    return app
}

module.exports.loadExpress = loadExpress
