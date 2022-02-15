const express = require('express');
const route = express.Router();
const customerService = require('../../services/customers')
const permit = require('../../auth/roleAuthorization');
const config = require('../../config/index').users

//Json for table // No request needed
route.get('/all-customers', async (req, res) => {
    const result = await customerService.getAllCustomers(req.query)
    res.jsonp(result)
})

route.post('/get-customer', async (req, res) => {
    const customerID = req.body
    const result = await customerService.getCustomer(customerID)

    if (result['status'] === `ERR`)
        console.log(result['info']);

    res.jsonp(result)
})

route.post(`/new-customer`,permit(config.roles.OPERATOR, config.roles.ADMIN), async (req, res) => {

    const customerData = req.body
    const result = await customerService.addCustomer(customerData)

    if (result['status'] == `ERR`)
        console.log(result['info']);

    res.jsonp(result)
})

route.put(`/modify-customer`,permit(config.roles.OPERATOR, config.roles.ADMIN), async (req, res) => {
    //Valid some stuff /!
    const customerData = req.body
    const result = await customerService.modifyCustomer(customerData)

    if (result['status'] == `ERR`)
        console.log(result['info']);



    res.jsonp(result)
})

route.delete(`/remove-customer`,permit(config.roles.OPERATOR, config.roles.ADMIN), async (req, res) => {
    const customerData = req.body
    const result = await customerService.removeCustomer(customerData)

    if (result['status'] == `ERR`)
        console.log(result['info']);

    res.jsonp(result)
})



module.exports = route
