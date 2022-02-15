const twilio = require('./twilio')
const Panel = require('../models/Panel')
const Property = require('../models/Property')
const alerts = require('./alerts')
const setting = require('../models/Setting')
const config = require('../config/index').twilio
//Services to manage any kind of device

//Add new device
const initPanel = async(deviceDetails,user) =>{
    const result = {}
    const cleanPanel = await validAndRebuildPanel(deviceDetails)
    cleanPanel.initBy = user._id //attach user
    let isInit = false

    if(cleanPanel['status'] === 'ERR'){
        return cleanPanel
    }

    try{
        const isInstalled = await twilio.sendSMS(cleanPanel['simNumber'],config.initCode)
        if(isInstalled){
            const newPanel = await Panel
            .findOneAndUpdate({
                'simNumber':cleanPanel['simNumber']},
                cleanPanel,
                {
                    new: true,
                    upsert:true
                })
            //Count 10 seconds to check if validation is complete
            let countTo10 = 10
            while(!isInit && countTo10>0){
                await delay(2000)
                countTo10--
                const testPanel = await Panel.findById({_id:newPanel._id})
                if(testPanel['initStatus']){
                    isInit = true
                    //Panel init ? Set phone numbers
                    await setNumber(cleanPanel['simNumber'])
                    result['status'] = 'OK'
                }else{
                    result['status'] = 'ERR'
                    result['info'] = 'No validation'
                }
            }
        }
    }
    catch(err){
        result['status'] = 'ERR'
        result['info'] = err
    }
    return result
}

const configPanel = async(deviceDetails,user) =>{
    await setNumber(deviceDetails.simNumber)

}
//!!Init code is here!!//
const setNumber = async(simNumber) =>{
    const setting_buffer = await setting.findById('setting')
    const contacts = await propertyContacts(simNumber)
    const setNumCode = `*6666*51${setting_buffer.phones.phone1},0,1*52${setting_buffer.phones.phone2},0,1*53${setting_buffer.phones.phone3},1,1*54${contacts.contact1},0,1*55${contacts.contact2},0,1*`
    const isSent = await twilio.sendSMS(simNumber,setNumCode)
    if(isSent){
        console.log('The setting was sent to '+ simNumber);
        let countTo10 = 10
        let isNumbersSet = false
        let panelTest
        while(!isNumbersSet && countTo10>0){
            await delay(2000)
            panelTest = await Panel.findOne({'simNumber':simNumber})
            if(panelTest.initNumbers.length > 0){
                return
            }
        }
        //While waiting nothing was changed = mean no SMS was sent back
        if(panelTest.initNumbers.length < 0){
            throw('Setting was sent, but no feedback from panel')
        }

    }else{
        //Twilio fail to send SMS
        console.error('Setting wasnt sent')
        throw('Setting wasnt sent')
    }
}

const initValid = (message) =>{
    const sender = message['from']
    try{
        Panel.findOneAndUpdate({simNumber:sender},{initStatus:true},(err,result)=>{
            if(err){
                console.error(err);
            }else{
                console.log("Device Valid: "+result['simNumber']);
            }
        })
    }catch(err){
        console.error(err);
    }
}

const numberValid = async(message) =>{
    const sender = message['from']
    const messageBody = message['body']
    const phoneQue = []
    switch(true){
        case messageBody.includes(config.phone1):{
            phoneQue.push(config.phone1)
        }
        case messageBody.includes(config.phone2):{
            phoneQue.push(config.phone2)
        }
        case messageBody.includes(config.phone3):{
            phoneQue.push(config.phone3)
        }
        default:{
            await Panel.findOneAndUpdate({simNumber:sender},{initNumbers:phoneQue})
        }
    }

}

const getAllDevices = async(withCustomer) =>{
    const result = {}
    try{
        if(withCustomer === 'true' || withCustomer === true){
            result.data = await Panel.find().populate('customer')
        }
        else{
            result.data  = await Panel.find()
        }
        result['status'] = 'OK'
    }catch (err){
        result['status'] = 'ERR'
        result['data'] = err
        console.error(err);
    }
    return result
}

const getDevice = async(device) =>{
    let result = {}
    try{
        const thisDevice = await Panel.findById(device['_id']).populate('customer').populate('property')
        result['status'] = 'OK'
        result['data'] = thisDevice
    }catch(err){result = await errorHandler(result,err)}
    return result
}

const updateDevice = async(summary) =>{
// summary should include '_id' and 'action'
    let result = {}
    try{
        console.log(summary.action)
        if(summary.action === 'update') {
            const panelCursor = await Panel.findById(summary.currentDevice._id)

            //Parsing to dictionary
            panelCursor['devices'] = {}
            summary['deviceList'].forEach(device => {
                panelCursor['devices'][device['zone']] = {
                    name: device['name'],
                    deviceType: device['deviceType']
                }
            });
            panelCursor['deviceCount'] = summary['deviceList'].length
            await Panel.findOneAndUpdate({_id: panelCursor._id}, panelCursor)
        } else if (summary.action === 'delete'){
            await Panel.findByIdAndRemove(summary.currentDevice._id)
        }
        result['status'] = 'OK'
    }catch(err){result = await errorHandler(result,err)}
    return result
}

async function disarmDevice(alertDetails, user){
    const newStatus = {
        alertID:alertDetails._id,
        status:alertDetails.status,
        comment:'Alert dismiss'
    }
    try{
        await twilio.sendSMS(alertDetails.origin,config.dismissCode)
        await alerts.changeStatus(newStatus,user)
    } catch(err){
        console.error(err)
    }
}

//Helpers (addon services)
//Find contacts to update
const propertyContacts = async (simNum) =>{
    const contacts = {
        contact1:'',
        contact2:''
    }
    try{
        const currentPanel = await Panel.findOne({simNumber:simNum}).populate('property')
        const currentProperty = currentPanel.property
        if(currentProperty.contacts.length === 1){
            contacts.contact1 = (currentProperty.contacts[0].phone).slice(1)
        }
        else if(currentProperty.contacts.length > 1){
            contacts.contact1 = currentProperty.contacts[0].phone.slice(1)
            contacts.contact2 = currentProperty.contacts[1].phone.slice(1)
        }
    }catch (err){
        console.error(err)
    }
    return contacts
}

//Re valid & build clean body
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const validAndRebuildPanel = async(deviceDetails) =>{
    const errors = []
    const cleanDevice = {}

    if(deviceDetails['simNumber'] !== undefined && deviceDetails['simNumber'] !=='')
        cleanDevice['simNumber'] = deviceDetails['simNumber']
    else
        errors.push('No SIM number provided')
    
    if(deviceDetails['property'] !== undefined && deviceDetails['property'] !=='')
        cleanDevice['property'] = deviceDetails['property']
    else
        errors.push('No property provided')

    if(deviceDetails['customer'] !== undefined && deviceDetails['customer'] !=='')
        cleanDevice['customer'] = deviceDetails['customer']

    if(errors.length >0){
        cleanDevice['status'] = 'ERR'
        cleanDevice['info'] = errors
    }
    return cleanDevice
}
const errorHandler = async(result,err) =>{
    result['status'] = 'ERR'
    result['data'] = err
    console.error(err);
    return result
}

module.exports.initPanel = initPanel
module.exports.configPanel = configPanel
module.exports.initValid = initValid
module.exports.numberValid = numberValid
module.exports.getAllDevices = getAllDevices
module.exports.getDevice = getDevice
module.exports.updateDevice = updateDevice
module.exports.disarmDevice = disarmDevice
