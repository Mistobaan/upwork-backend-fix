const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const requestIp = require('request-ip')
const User = require('../models/User')
const config = require('../config').users
const emailService = require('../services/sendgrid')

const loginToken = async(req,res) =>{
    const result ={
        status:'ERR'
    }
    if(req.body.email === undefined || req.body.password === undefined){
        result['info'] = 'You need to provide username & password'
        return res.jsonp(result)
    }
    const clientIp = requestIp.getClientIp(req) // Find user IP
    try{
        const userFound = await User.findOne({'email':req.body.email})
        if(!userFound){
            result['info'] = 'User not exists'
            return res.jsonp(result)
        }
        const matchPass = await bcrypt.compare(req.body.password,userFound.password)
        if(matchPass){
            const token = jwt.sign({
                _id:userFound._id,
                role:userFound.role,
                name:userFound.name
            },config.jwtToken,{expiresIn:'365 days'})
            result['status'] = 'OK'
            result['token'] = token
            emailService.sendEmail('Successful login', `The user ${userFound.name} with ID ${userFound._id} logged in successfully.
            From device: ${req.rawHeaders['user-agent']} from ip ${clientIp}`)
            return res.header(config.jwtHeader,token).jsonp(result)
        }else{
            result['info'] = ("Incorrect password")
        }
    }catch(err){
        console.log(err);
        result['info'] = ("Error login")
    }
    return result
}

module.exports = {loginToken}