const jwt = require('jsonwebtoken')
const config = require('../config').users

module.exports = function (req, res, next) {
    // const token = req.header(config.jwtHeader)
    // if(!token) return res.status(401).send('Access Denied')

    // try{
    //     const verified = jwt.verify(token,config.jwtToken)
    //     req.user = verified
    //     console.log("user",req.user)
    //     next()
    // }catch(err){
    //     res.status(400).send('Invalid Token')
    // }
    // console.log("In verification token");
    const excluded = ['/api/login','/api/incoming-sms', '/incoming-sms', '/login'];

    if (excluded.indexOf(req.url) > -1) return next();

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    
    jwt.verify(token, config.jwtToken, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        // console.log("Token Verified");
        next()
    })
}