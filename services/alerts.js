const Alarm = require('../models/Alarm')

const getAllAlarms = async(parameters) =>{
    const result = {}
    const holder = await dataTableQuery(parameters)

    try{
        const alarmsFound =
            await Alarm
            .find(holder.searchQuery)
            .sort(holder.orderBy)
            .skip(holder.skip)
            .limit(holder.limit)

        result['recordsFiltered'] = await Alarm.find(holder.searchQuery).countDocuments()
        result['recordsTotal'] = await Alarm.countDocuments()
        result['data'] = alarmsFound
        result['status'] = 'OK'
    }catch(err){
        result['status'] = 'ERR'
        result['info'] = err
        console.error(err);
    }

    return result
}

const changeStatus = async(request,user)=>{
    const result ={}
    const alertID = request['alertID']
    const newStatus = request['status']
    const userComment = request['comment']
    try{
        await Alarm.findByIdAndUpdate(alertID,{
            status:newStatus,
            $push:{statusHistory:{status:newStatus,comment:userComment,initiator:user._id, date:Date.now()}}
        })
        result['status'] = 'OK'
    }catch(err){
        result['status'] = 'ERR'
        result['info'] = err
    }
    return result
}

const countAlertByStatus = async() =>{
    const counter = {
        status: 'OK',
        newAlerts:-1,
        work:-1,
        closed:-1
    }
    try{
        counter.newAlerts = await Alarm.countDocuments({status:'new'})
        counter.work = await Alarm.countDocuments({status:'work'})
        counter.closed = await Alarm.countDocuments({status:'dismiss'})
    }catch (err){
        counter.status = 'ERR'
        console.error(err)
    }
    return counter
}

//------------------------------------------------------------------------------------------//
//Helpers
const dataTableQuery = async(parameters) =>{
    const holder = {}

    //Searching
    const searchQuery = {}
    parameters.columns.forEach(column=>{
        if(column.search.value !== '' && column.searchable){
            searchQuery[column.data] = column.search.value
        }
    })

    //Specific configuration for timestamp
    if(parameters.dateRange !== undefined){
        if(parameters.dateRange.startDate !== undefined){
            searchQuery['timestamp'] = {$gte:parameters.dateRange.startDate}
        }
        if(parameters.dateRange.endDate !== undefined){
            searchQuery['timestamp'] = {$lt:parameters.dateRange.endDate}
        }
        if(parameters.dateRange.endDate !== undefined && parameters.dateRange.startDate !== undefined){
            searchQuery['timestamp'] = {$gte:parameters.dateRange.startDate, $lt:parameters.dateRange.endDate}
        }
    }

    //Sorting
    const orderByCol = parameters['order'][0]['column']
    const colName = parameters['columns'][orderByCol]['data']
    let howToOrder
    if (parameters['order'][0]['dir'] === 'asc'){
        howToOrder = 1
    }else{
        howToOrder = -1
    }
    holder.searchQuery = searchQuery
    holder.orderBy = {}
    holder.orderBy[colName] = howToOrder
    holder.limit = parameters['length'] //Limit how much in page
    holder.skip = parameters['start'] //How much to skip (what page we are)

    return holder
}

module.exports = {getAllAlarms,changeStatus,countAlertByStatus}
