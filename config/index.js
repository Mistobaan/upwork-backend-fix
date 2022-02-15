const dotenv = require('dotenv');

dotenv.config();
const allowTwilio = (process.env.ALLOW_TWILIO === 'TRUE')
const allowAzure = (process.env.ALLOW_AZURE === 'TRUE')
const allowB2Read = (process.env.ALLOW_B2_READ === 'TRUE')
const allowB2Write = (process.env.ALLOW_B2_WRITE === 'TRUE')
const allowS3Read = (process.env.ALLOW_S3_READ === 'TRUE')
const allowS3Write = (process.env.ALLOW_S3_WRITE === 'TRUE')

module.exports = {
  port: process.env.PORT,
  dbhost: process.env.DBHOST,
  name:'DigitalShield',
  envs:{
    twilio: allowTwilio,
    azure: allowAzure,
    b2_read: allowB2Read,
    b2_write: allowB2Write,
    s3_read: allowS3Read,
    s3_write: allowS3Write
  },
  api: {
    prefix: '/api'
  },
  twilio: {
    accountSid: process.env.TWILLO_SID,
    authToken: process.env.TWILLO_AUTH,
    from: '+972526104841',
    phone1: '0526104841',
    phone2: '0526371718',
    phone3: '0507181966',
    initCode: '*6666*43*',
    dismissCode:'1234#2'
  },
  sendgrid:{
    apiKey: process.env.SENDGRID_API_KEY,
    from: 'alerts@mailservice.davidt.net',
    to:'xdavidt@gmail.com'
  },
  b2:{
    keyId:process.env.B2_KEY_ID,
    key:process.env.B2_KEY,
    bucket:process.env.B2_BUCKET_ID,
    getFileURL: 'https://f001.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId='
  },
  awsS3:{
    keyID:process.env.AWS_S3_KEY_ID,
    key:process.env.AWS_S3_KEY_SECRET,
    region: 'eu-central-1',
    bucketId:"digital-shield-record"
  },
  azure: {
    speechKey:process.env.SPEECH_KEY,
    speechRegion: 'francecentral'
  },
  property:{
    types:[
      {
        value: 'apartment',
        title: 'Apartment'
      },
      {
        value:'ground-house',
        title: 'Ground house'
      },
      {
        value:'storeroom',
        title:'Storeroom'
      }
    ]
  },
  devices: {
    types: [
      {
        value: 'fire',
        title: 'Fire 🔥'
      },
      {
        value: 'co',
        title: 'Water 💧'
      },
      {
        value: 'gas',
        title: 'Gas ☣'
      },
      {
        value: 'sos',
        title: 'SOS 🆘'
      }
    ]
  },
  config: {
    statusOpt: [
      {
        title: 'New',
        value: 'new'
      },
      {
        title: 'Work',
        value: 'work'
      },
      {
        title: 'Done',
        value: 'dismiss'
      }
    ]
  },
  users: {
    jwtHeader: 'auth-token',
    jwtToken: 'secretcat',
    userRoles: [
      {
        title: 'Admin',
        role: 'admin'
      },
      {
        title: 'Technician',
        role: 'tech'
      },
      {
        title: 'Operator',
        role: 'op'
      },
      {
        title: 'Viewer',
        role: 'view'
      }
    ],
    roles: {
      ADMIN: 'admin',
      TECHNICIAN: 'tech',
      OPERATOR: 'op'
    }

  }
}
