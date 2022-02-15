const B2 = require('backblaze-b2');
const fs = require("fs");

const envs = require('../config').envs
const b2Config = require('../config').b2

const b2 = new B2({
    applicationKeyId: b2Config.keyId, // or accountId: 'accountId'
    applicationKey: b2Config.key // or masterApplicationKey
})

const isFileExists = async(filename) =>{
    try{
        if (!envs.b2_read) return
        await b2.authorize()
        const getFiles = await b2.listFileNames({
            bucketId: b2Config.bucket,
            maxFileCount:2,
            startFileName:filename
        })
        for(let file of getFiles.data.files){
           if(file.fileName === filename){
               return b2Config.getFileURL + file.fileId
           }
        }
        return null
    }catch (err){
        console.error(err)
    }
    return null
}

const uploadFile = async(fileName,filePath) =>{
    try {
        await b2.authorize()
        const response = await b2.getUploadUrl({bucketId: b2Config.bucket})
        if (!envs.b2_write) return
        const uploadedFile = await b2.uploadFile({
            uploadUrl: response.data.uploadUrl,
            uploadAuthToken: response.data.authorizationToken,
            fileName: fileName,
            data: fs.readFileSync(filePath)
        })
        const fileId = uploadedFile.data.fileId
        return b2Config.getFileURL + fileId
    }catch (err){
        console.error(err)
    }
}

module.exports = {isFileExists, uploadFile}
