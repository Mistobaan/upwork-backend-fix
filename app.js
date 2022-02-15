const express = require('express')
const config = require('./config')
const load = require('./loaders')

async function startServer() {

  const app = express()
  await load(app)


  app.listen(config.port,"0.0.0.0", err => {
    if (err) {
      console.log(err)
      return
    }
    console.log(`Your server is ready in port ${config.port}`);
  });
}

startServer();
