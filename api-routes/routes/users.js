const express = require('express');
const route = express.Router();
const config = require('../../config/index').users
const verify = require('../../auth/verfiyToken')
const authService = require('../../auth/login')
const usersService = require('../../services/users')
const permit = require('../../auth/roleAuthorization');




/** All the belowed routes need token verification */


route.post('/login', authService.loginToken)

route.use(verify);

route.get('/user-roles', (_, res) => {
    const userRoles = config.userRoles
    res.jsonp(userRoles)
})

route.post('/new-user',permit(config.roles.ADMIN), async (req, res) => {
    const userDetails = req.body
    const result = await usersService.registerUser(userDetails)
    res.jsonp(result)
})

route.get('/all-users',permit(config.roles.ADMIN), async (_, res) => {
    const result = await usersService.getUsers()
    res.jsonp(result)
})

route.put('/update-user',permit(config.roles.ADMIN), async (req, res) => {
    const result = await usersService.updateUser(req.body)
    res.jsonp(result)
})
route.put('/delete-user',permit(config.roles.ADMIN), async (req, res) => {
    const result = await usersService.deleteUser(req.body._id)
    res.jsonp(result)
})

module.exports = route