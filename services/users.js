const bcrypt = require('bcrypt');
const User = require('../models/User')
const usersConfig = require('../config/index').users

const saltRounds = 10

//Prod functions
const registerUser = async(userDetails) =>{
    const result = {}
    try{
        const validUser = await buildAndValidUser(userDetails)
        await User.create(validUser)
        result.status = 'OK'
    }
    catch(err){
        result.status = 'ERR'
        result.info = err
        console.error(err);
    }
    return result
}

const getUsers = async() =>{
    const result ={}
    try{
        result.data = await User.find({})
        result.status = 'OK'
    }catch(err){
        console.error(err);
        result.status = 'ERR'
        result.info = err
    }
    return result
}

const updateUser = async(reqBody) =>{
    const result = {}
    let newDetails
    if(reqBody.action == 'update'){
        newDetails = await buildUserUpdate(reqBody.data)
    }else if(reqBody.action == 'pass'){
        newDetails = await updatePassword(reqBody.data)
    }else{
        return
    }

    try{
        await User.findByIdAndUpdate(
            reqBody._id,
            newDetails
            )
        result.status = 'OK'
    }catch(err){
        console.error(err);
        result.status = 'ERR'
        result.info = err
    }
    return result
}

const deleteUser = async(userId) =>{
    const result = {}
    try{
        const selectedUser = await User.findById(userId)
        if(!selectedUser.root){
            await User.findByIdAndRemove(userId)
        }
        result.status = "OK"
    }catch(err){
        console.error(err);
        result.status = 'ERR'
        result.info = err
    }
    return result
}

//Addon function
const buildAndValidUser = async(userDetails) =>{
    const errors = []
    const validUser = {}
    if(userDetails.fullName != undefined) validUser.name = userDetails.fullName
    if(userDetails.email != undefined) validUser.email = userDetails.email
    else errors.push('missing email')
    if(userDetails.phone != undefined) validUser.phone = userDetails.phone
    else errors.push('missing phone')
    if(userDetails.role != undefined){
        if(usersConfig.userRoles.map(thisRole=>thisRole.role).includes(userDetails.role)){
            validUser.role = userDetails.role
        }
        else{
            errors.push('this rule cant be found')
        }
    } 
    if(userDetails.password != undefined){
        validUser.password = await bcrypt.hash(userDetails.password, saltRounds)
    }else{
        errors.push('password missing')
    }
    if(errors.length >0){
        throw(errors)
    }
    return validUser
}

const buildUserUpdate = async(userDetails) =>{
    const validUser = {} 
    if(userDetails.name != undefined && userDetails.name != '') validUser.name = userDetails.name
    if(userDetails.email != undefined && userDetails.email != '') validUser.email = userDetails.email
    if(userDetails.phone != undefined && userDetails.phone != '') validUser.phone = userDetails.phone
    if(userDetails.role != undefined){
        if(usersConfig.userRoles.map(thisRole=>thisRole.role).includes(userDetails.role)){
            validUser.role = userDetails.role
        }
    }
    return validUser
}

const updatePassword = async(userAndPass) =>{
    const newDetails = {}
    newDetails.password = await bcrypt.hash(userAndPass.password,saltRounds)
    return newDetails
}

module.exports = {registerUser,getUsers,updateUser,deleteUser}