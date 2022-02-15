var Queue = require('queue-fifo');
const Alarm = require('../models/Alarm')
const Panel = require("../models/Panel");
const Customer = require("../models/Customer")
const Property = require("../models/Property")
const getTranslation = require('../translation/textLoader')
const twilioService = require("./twilio");
const {getSpeech} = require('./speechAzure')
const moment = require("moment");

const cacheAlarms = new Queue() //Fill up inside extractRelevantInformation

const alarmRegister = async(smsDetails) =>{
    const {kind,zone} = await smsParserAlarm(smsDetails.body)
    try {
        const detailAlert = await extractRelevantInformation(smsDetails.from,kind,zone)
        await Alarm.create(detailAlert)
        await alertCustomer(detailAlert.property,kind.toLowerCase())
        return true
    } catch(err) {
        console.error(err);
        return false
    }
}

const disarmRegister = async(smsDetails) =>{
    const lastHour = moment().utc().subtract(1, 'day').toISOString()
    try{
        await Alarm.findOneAndUpdate({
            'origin':smsDetails.from,
            timestamp: {$gt:lastHour}
            },{
            $push:{
                statusHistory:{
                    comment:"System disarm by customer",
                    date: moment().utc().toISOString()
                }
            }
        })
        return true
    }catch (err){
        console.log(err)
        console.error(err)
        return false
    }
}

const powerChangeRegister = async(smsDetails) =>{
    const statusBool = await smsParserAC(smsDetails.body)
    const kind = 'power'
    try{
        await Panel.findOneAndUpdate({'simNumber':smsDetails.from},
            {powerStatus:statusBool})
        if(!statusBool){
            const detailAlert = await extractRelevantInformation(smsDetails.from,kind,0)
            await Alarm.create(detailAlert)
            await alertCustomer(detailAlert.property,kind)
        } else{
            const dismiss = 'dismiss'
            await Alarm.findOneAndUpdate({
                'origin':smsDetails.from,
                'kind':'power'
            },{
                'status':dismiss,
                $push:{
                    statusHistory:{
                        status:dismiss,
                        comment:'Panel Restored',
                        date:moment().utc().toISOString()
                    }
                }
            })
        }
    }catch (err){
        console.error(err)
        return false
    }
    return true
}

const checkForAlarms = async() =>{
    const result = {
        status:'OK'
    }
    if(!cacheAlarms.isEmpty()){
        result['alarm'] = cacheAlarms.dequeue()
    }
    return result
}

async function alertCustomer(property,kind) {
    const getUserLang = await getLanguage()
    const userLocalText = await getTranslation(getUserLang)
    if (property.contacts.length === 0) return
    for(let contact of property.contacts){
        await alertBySMS(contact,userLocalText,kind)
        await alertByCall(contact,userLocalText,kind)
        // await alertByWhatsapp(contact,userLocalText,kind)
    }
}

async function alertBySMS(contact,text,kind){
    const textMerged = await buildSentence(contact,text,kind)
    try{
        await twilioService.sendSMSAlert(contact,textMerged)
    }catch (err){
        console.error(err)
    }
}

async function alertByWhatsapp(contact,text,kind){
    const textMerged = await buildSentence(contact,text,kind)
    try{
        await twilioService.sendWhatsappAlert(contact,textMerged)
    }catch (err){
        console.error(err)
    }
}

async function alertByCall(contact,text,kind){
    const speechURL = await getSpeech(contact,text,kind)
    await twilioService.callContactsAlert(contact,speechURL)
}

// ---------------------------------------------- Auxiliary functions ---------------------------------------------- //
const extractRelevantInformation = async(from,kind,zone) =>{
    const sumDetails = {
        origin:from,
        kind:kind.toLowerCase(),
        zone:zone,
        status:'new',
        timestamp: moment().utc().toISOString()
    }
    cacheAlarms.enqueue(sumDetails)
    try {
        const thisPanel = await Panel.findOne({'simNumber':from})
        sumDetails['fatherPanel'] = thisPanel
        sumDetails.customer = await Customer.findById({_id:thisPanel['customer']})
        sumDetails.property = await Property.findById({_id:thisPanel['property']})
    }catch (err){
        console.error(err)
    }
    return sumDetails
}

const smsParserAlarm = async(smsToParse) =>{
    let zone
    const smsRows = smsToParse.split('\n')
    const kind = smsRows[1].split(' Alarm')[0]
    try {   //In case alarm came without a zone
        zone = smsRows[2].split('Zone:')[1]
    } catch (_) {
        zone = 0
    }
    return {kind,zone}
}

const smsParserAC = async(smsToParse) =>{
    return !smsToParse.includes('AC Power Failure');
}

const buildSentence = async(contact,text,kind) =>{
    return text.hello + contact.name + text.gotAlert + text.kind[kind] + text.pleaseCheck
        + text.thankYou + text.digitalShield
}
const getLanguage = async() =>{
    return 'he-IL'
}

module.exports = {alarmRegister,powerChangeRegister,disarmRegister,checkForAlarms}
