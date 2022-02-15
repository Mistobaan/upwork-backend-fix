const setting = require('../models/Setting')
const {response} = require("express");

const getSetting = async() =>{
    const result = {}
    try{
        const foundSetting = await setting.findOne({_id:'setting'})
        result.status = 'OK'
        result.data = foundSetting
    }catch (err){
        result.status = 'ERR'
        result.data = err
    }
    return result
}

const updateSetting = async(newSetting) =>{
    const result = {}
    try{
        // await setting.create(newSetting)
        await setting.findByIdAndUpdate('setting',newSetting, {
            upsert: true
        })
        result.status = 'OK'
    }catch (err){
        result.status = 'ERR'
        result.details = err
    }
    return result
}

module.exports = {getSetting,updateSetting}
