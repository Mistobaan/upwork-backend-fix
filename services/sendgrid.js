const sgMail = require('@sendgrid/mail');
const config = require('../config').sendgrid

sgMail.setApiKey(config.apiKey);

function sendEmail(subject,msg){
    const newMsg = {
        to:config.to,
        from:config.from,
        subject:subject,
        text:msg
    }

    sgMail
        .send(newMsg)
        .then(()=>{},error=>{
            console.error(error)
            if (error.response) {
                console.error(error.response.body)
            }
        })
}

module.exports = {sendEmail}