const cleanDeep = require('clean-deep');
const Property = require('../models/Property')

//Services to manage properties of customers

//Adding new property
const addProperty = async(propertyDetails) =>{
    const result = {}
    const cleanProperty = await validAndRebuild(propertyDetails)
    
    if(cleanProperty['errors'] !== undefined){
        result['status'] = 'ERR'
        result['info'] = cleanProperty['errors']
        return result
    }

    try{
        await Property.create(cleanProperty)
        result['status'] = `OK`
    }
    catch(err){
        result['status'] = 'ERR'
        result['info'] = err

        //Specific error for Matching issue
        // if(err['errors']['owner']['kind'] == 'ObjectId'){
        //     result['info'] = 'Property and owner match has been failed'
        // }
    }
    return result
}

const editProperty = async(propertyDetails) =>{
  const result = {}
  //Check id is provided before start
  if(!await isIdValid(propertyDetails)){
      result['status'] = 'ERR'
      result['info'] = 'Must have ID to edit'
      return result
  } 
  
  const cleanProperty = await rebuildProperty(propertyDetails)

  try {
    const filter = {_id: cleanProperty._id}
    await Property.findOneAndUpdate(filter,cleanProperty)
    result['status'] = 'OK'
  }catch(err){
    result['status'] = 'ERR'
    result['info'] = err
  }
  return result
}

const deleteProperty = async(propertyDetails) =>{
    const result ={}

    try{
        await Property.findByIdAndDelete(propertyDetails)
        result['status'] = 'OK'
    }
    catch(err){
        result['status'] = 'ERR'
        result['info'] = err
    }

    return result
}

const getAllProperties = async() =>{
    const result = {}

    try{
        const properties = await Property.find().populate('owner')
        result['status']='OK'
        result['data'] = properties
    }
    catch(err){
        result['status']='ERR'
        result['info'] = err
    }
    return result
}

//Helpers (addon services)

//Validate property have all needed & build without extras
const validAndRebuild = async(propertyDetails) =>{
    const cleanProperty = {}
    const errors = []
    const contacts = []

    if(propertyDetails['phone'] !== undefined && propertyDetails['phone'] !== '')
        cleanProperty['phone'] = propertyDetails['phone']
    if(propertyDetails['type'] !== undefined && propertyDetails['type'] !== '')
        cleanProperty['type'] = propertyDetails['type']
    else
        errors.push('no type provided')

    cleanProperty['location'] = {}

    if(propertyDetails['street'] !== undefined && propertyDetails['street'] !== '')
        cleanProperty['location']['street'] = propertyDetails['street']
    else
        errors.push('No street provided')
    if(propertyDetails['houseNum'] !== undefined && propertyDetails['houseNum'] !== '')
        cleanProperty['location']['houseNum'] = propertyDetails['houseNum']
    else
        errors.push('No house number provided')
    if(propertyDetails['aptNum'] !== undefined && propertyDetails['aptNum'] !== '')
        cleanProperty['location']['aptNum'] = propertyDetails['aptNum']
    if(propertyDetails['floor'] !== undefined && propertyDetails['floor'] !== '')
        cleanProperty['location']['floor'] = propertyDetails['floor']
    if(propertyDetails['city'] !== undefined && propertyDetails['city'] !== '')
        cleanProperty['location']['city'] = propertyDetails['city']
    else
        errors.push('City was not provided')
    if(propertyDetails['notes'] !== undefined && propertyDetails['notes'] !== '')
        cleanProperty['location']['notes'] = propertyDetails['notes']
    if(propertyDetails['zipcode'] !== undefined && propertyDetails['zipcode'] !== '')
        cleanProperty['location']['zipcode'] = propertyDetails['zipcode']
    if(propertyDetails['geoLocation'] !== undefined && propertyDetails['geoLocation'] !== ''){
        cleanProperty['location']['geoLocation'] = {}
        cleanProperty['location']['geoLocation']['lat'] = propertyDetails['geoLocation']['lat']
        cleanProperty['location']['geoLocation']['lng'] = propertyDetails['geoLocation']['lng']
    }
    else{
        errors.push('No geolocation found')
    }
    if(propertyDetails['owner'] !== undefined && propertyDetails['owner'] !== ''){
        cleanProperty['owner'] = propertyDetails['owner']
    }
    else{
        errors.push('No owner provided for match')
    }
    if(propertyDetails['contacts'] !== undefined){
        const contactsArr = propertyDetails['contacts']
        cleanProperty['contacts'] = cleanDeep(contactsArr)
    }
    else{
        errors.push('Must include contacts')
    }

    if(errors.length>0)
        cleanProperty['errors'] = errors

    return cleanProperty
}

//When editing, no need to have all objects, since that it's only rebuild
const rebuildProperty = async(propertyDetails) =>{
    const cleanProperty = {}

    if(propertyDetails['_id'] !== undefined && propertyDetails['_id'] !== '')
        cleanProperty['_id'] = propertyDetails['_id']
    if(propertyDetails['phone'] !== undefined && propertyDetails['phone'] !== '')
        cleanProperty['phone'] = propertyDetails['phone']
    if(propertyDetails['type'] !== undefined && propertyDetails['type'] !== '')
        cleanProperty['type'] = propertyDetails['type']


    cleanProperty['location'] = {}

    if(propertyDetails['street'] !== undefined && propertyDetails['street'] !== '')
        cleanProperty['location']['street'] = propertyDetails['street']
    if(propertyDetails['houseNum'] !== undefined && propertyDetails['houseNum'] !== '')
        cleanProperty['location']['houseNum'] = propertyDetails['houseNum']
    if(propertyDetails['aptNum'] !== undefined && propertyDetails['aptNum'] !== '')
        cleanProperty['location']['aptNum'] = propertyDetails['aptNum']
    if(propertyDetails['floor'] !== undefined && propertyDetails['floor'] !== '')
        cleanProperty['location']['floor'] = propertyDetails['floor']
    if(propertyDetails['city'] !== undefined && propertyDetails['city'] !== '')
        cleanProperty['location']['city'] = propertyDetails['city']
    if(propertyDetails['notes'] !== undefined && propertyDetails['notes'] !== '')
        cleanProperty['location']['notes'] = propertyDetails['notes']
    if(propertyDetails['zipcode'] !== undefined && propertyDetails['zipcode'] !== '')
        cleanProperty['location']['zipcode'] = propertyDetails['zipcode']
    if(propertyDetails['geoLocation'] !== undefined && propertyDetails['geoLocation'] !== ''){
        cleanProperty['location']['geoLocation'] = {}
        cleanProperty['location']['geoLocation']['lat'] = propertyDetails['geoLocation']['lat']
        cleanProperty['location']['geoLocation']['lng'] = propertyDetails['geoLocation']['lng']
    }

    if(propertyDetails['owner'] !== undefined && propertyDetails['owner'] !== ''){
        cleanProperty['owner'] = propertyDetails['owner']
    }

    if(propertyDetails['contacts'] !== undefined){
        const contactsArr = propertyDetails['contacts']
        cleanProperty['contacts'] = cleanDeep(contactsArr)
    }
    return cleanProperty
}

const isIdValid = async(propertyDetails) =>{
    return !(propertyDetails['_id'] === undefined || propertyDetails['_id'] === '');
}

module.exports = {addProperty, editProperty, getAllProperties, deleteProperty}
