const Customer = require('../models/Customer')

//Services to manage customers (add/remove/edit etc..)

//Add new customer
const addCustomer = async(customerDetails) =>{
    const result = {}
    const clearCustomer = await rebuildCustomer(customerDetails)
    const validation = await validCustomer(clearCustomer)


    if(validation['status'] == `ERR`){
        return validation['errors']
    }

    else {
        try{
            //Update indexes before saving new ID
            Customer.syncIndexes()

            const newCustomer = await Customer.create(clearCustomer)
            result['status'] = `OK`
            // result['data'] = newCustomer //!
        } catch(err){
            result['status'] = `ERR`
            result['info'] = err

            // If ID already exists, send back a simple clear error
            if(err.code == 11000 && err.keyPattern['customerID'] == 1){
                result['info'] = 'ID already exists'
            }
            else if(err.code == 11000 && err.keyPattern['phone'] == 1){
                result['info'] = 'Phone exists'
            }
        }
        return result
    }
    
}

const modifyCustomer = async(customerDetails) =>{
    const result = {}
    const clearCustomer = await rebuildCustomer(customerDetails)
    try{
        const modifyCustomer = await Customer.updateOne({_id:customerDetails._id},clearCustomer)
        result['status'] = `OK`
        // result['data'] = modifyCustomer //!
    } catch(err){
        result['status'] = `ERR`
        result['info'] = err
        // If ID already exists, send back a simple clear error
        if(err.code == 11000 && err.keyPattern['customerID'] == 1){
            result['info'] = 'ID already exists'
            console.err(err);
        }
    }
    return result

}

const removeCustomer = async(customerDetails) =>{
    const result = {}
    if(customerDetails['_id'] === undefined || customerDetails['_id'] === ''){
        result['status'] = `ERR`
        result['info'] = `No id provided`
    } else {
        try{
            await Customer.findByIdAndRemove({_id: customerDetails['_id']})
            result['status'] = `OK`
        } catch(err){
            result['status'] = `ERR`
            result['info'] = err
        }
    }
    return result
}

const getAllCustomers = async(query)=> {
    let queryType = query.type;
    const result = {}
    
    try {
        let customers;
        if(queryType === 'all'){
            customers = await Customer.find();
        } else if (queryType === 'count') {
            customers = await Customer.countDocuments();
        }
        result['status'] = `OK`
        result['data'] = customers
    }catch(err){
        result['status'] = `ERR`
        result['info'] = err
    }
    return result
}

const getCustomer = async(customreID)=>{
    const result = {}
    try{
        const customer = await Customer.findById(customreID['_id'])
        result['status'] = `OK`
        result['data'] = customer
    }catch(err){
        result['status'] = `ERR`
        result['info'] = err
    }
    return result
}

//Helpers

//Validators for services
const validCustomer = async(customerDetails) =>{
    const validator = {}
    const errors = []
    validator['status'] = `OK`
    
    if(customerDetails['firstName'] == undefined || customerDetails['firstName'] ==''){
        errors.push('firstName missing')
    }
    if(customerDetails['lastName'] == undefined || customerDetails['lastName'] ==''){
        errors.push('lastName missing')
    }
    if(customerDetails['email'] == undefined || customerDetails['email'] ==''){
        errors.push('email missing')
    }
    if(customerDetails['phone'] == undefined || customerDetails['phone'] == ''){
        errors.push('phone missing or not a number')
    }
    if(customerDetails['location']['street'] == undefined || customerDetails['location']['street'] ==''){
        errors.push('street address is missing')
    }
    if(customerDetails['location']['city'] == undefined || customerDetails['location']['city'] ==''){
        errors.push('city address is missing')
    }

    if(errors.length > 0){
        validator['status'] = `ERR`
        validator['errors'] = errors
    }
    return validator
}

const rebuildCustomer = async(customerDetails) =>{
    const clearCustomer = {}
    const extraContacts = []
    if(customerDetails['firstName'] != undefined)
        clearCustomer['firstName'] = customerDetails['firstName']
    if(customerDetails['lastName'] != undefined)
        clearCustomer['lastName'] = customerDetails['lastName']
    if(customerDetails['phone'] != undefined)
        clearCustomer['phone'] = customerDetails['phone']
    if(customerDetails['email'] != undefined)
        clearCustomer['email'] = customerDetails['email']

    clearCustomer['location'] ={}
    if(customerDetails['street'] !== undefined)
        clearCustomer['location']['street'] = customerDetails['street']
    if(customerDetails['city'] != undefined)
        clearCustomer['location']['city'] = customerDetails['city']
    if(customerDetails['notes'] != undefined)
        clearCustomer['location']['notes'] = customerDetails['notes']
    if(customerDetails['zipcode'] != undefined)
        clearCustomer['location']['zipcode'] = customerDetails['zipcode']
    
    if(customerDetails['customerID'] != undefined)
        clearCustomer['customerID'] = customerDetails['customerID']
    if(customerDetails['business_client'] != undefined)
        clearCustomer['business_client'] = customerDetails['business_client']

    if (customerDetails['extraContact']!= undefined && customerDetails['extraPhone']!= undefined){
        const newContact = {}
        newContact['name'] = customerDetails['extraContact']
        newContact['phone'] = customerDetails['extraPhone']
        extraContacts.push(newContact)

        clearCustomer['extraContacts'] = newContact
    }
    return clearCustomer
}

module.exports = {addCustomer,modifyCustomer,removeCustomer,getAllCustomers, getCustomer}
