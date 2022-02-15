let S3 = require('aws-sdk/clients/s3')
const fs = require('fs')
const s3Conf = require('../config').awsS3
const envs = require('../config').envs

const s3 = new S3({
    region: s3Conf.region,
    accessKeyId:s3Conf.keyID,
    secretAccessKey:s3Conf.key
})

async function uploadFile(fileKey,filePath){
    try{
        const fileRead = fs.createReadStream(filePath)
        if(!envs.s3_write) return
        const uploadParams = {
            Bucket: s3Conf.bucketId,
            Body: fileRead,
            Key: fileKey
        }
        const uploadedFile = await s3.upload(uploadParams).promise()
        return uploadedFile.Location
    }catch (err){
        return null
    }

}

async function checkIfExists(fileKey){
    const params = {
        Bucket: s3Conf.bucketId,
        Key: fileKey
    }
    if(!envs.s3_read) return
    try {
        await s3.headObject(params).promise()
        return s3.getSignedUrl('getObject', params)
    } catch (error) {
        return null
    }
}

module.exports = {uploadFile,checkIfExists}
