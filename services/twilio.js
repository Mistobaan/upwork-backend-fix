const envs = require('../config').envs
const config = require('../config').twilio
// const client = require('twilio')(config.accountSid, config.authToken)
const SMS = require('../models/SMS')
const deviceService = require('./devices')
const alertRegister = require('./alertRegister')

const sendSMS = async (phoneNumber,body) =>{
    try{
        if (!envs.twilio) return
        await client.messages
        .create({
            body:body,
            from: config.from,
            to: phoneNumber
        })
        return true
    } catch(err) {
        console.log(err);
        return false
    }
}

const sendSMSAlert = async (contact,body) =>{
    try{
        if (!envs.twilio) return
        await client.messages
        .create({
            body:body,
            from: config.from,
            to: contact.phone
        })
    } catch(err) {
        console.error(err)
    }
}

const sendWhatsappAlert = async (contact,body) =>{
    try{
        if (!envs.twilio) return
        await client.messages
        .create({
            body:body,
            from: 'whatsapp:+14155238886', //Twilio Sandbox //Dev
            to: 'whatsapp:'+contact.phone
        })
        return true
    } catch(err) {
        console.log(err);
        return false
    }
}

const callContactsAlert = async (contact,speechURL) =>{
    try{
        if (!envs.twilio) return
        if(!speechURL || speechURL==='') return
        await client.calls
            .create({
            from: config.from,
            to: contact.phone,
            twiml:`<Response>
                <Play>${speechURL}</Play>
            </Response>`
        })
    }catch (err){
        console.error(err)
        return false
    }
    return true
}

const incomingSMS = async(messageBody) =>{
    const bodyContent = messageBody.Body
    const messageHolder = {
        from:messageBody.From,
        to:messageBody.To,
        body:messageBody.Body
    }
    await SMS.create(messageBody)
    switch(true){
        case bodyContent.includes('Alarm'):{
            return await alertRegister.alarmRegister(messageHolder)
        }
        case bodyContent.includes('AC Power'):{
            return await alertRegister.powerChangeRegister(messageHolder)
        }
        case bodyContent.includes('Initialization OK!'):{
            deviceService.initValid(messageHolder) //Sync func
            console.log('Init OK !')
            return true
        }
        case bodyContent.includes('PHONE set:'):{
            await deviceService.numberValid(messageHolder)
            console.log('Set complete');
            return true;
        }
        case bodyContent.includes('System Disarmed'):{
            return await alertRegister.disarmRegister(messageHolder)
        }
        default:{
            console.log(bodyContent);
        }
    }
}

module.exports.sendSMS = sendSMS
module.exports.sendSMSAlert = sendSMSAlert
module.exports.incomingSMS = incomingSMS
module.exports.callContactsAlert = callContactsAlert
module.exports.sendWhatsappAlert = sendWhatsappAlert
