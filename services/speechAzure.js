const sdk = require("microsoft-cognitiveservices-speech-sdk")
const fs = require("fs")
const sha1 = require("sha1")
const b2 = require('./b2')
const s3 = require('./s3')
const envs = require('../config').envs
const azureConf = require('../config').azure


const getSpeech = async(contact,text,kind) =>{
    const textToSpeech = text.hello + contact.name + text.gotAlert + text.kind[kind] + text.pleaseCheck
    const fileName = await generateFileHash(textToSpeech)
    let isFileExists = await s3.checkIfExists(fileName)
    if(isFileExists) return isFileExists
    else {
        const getDir = await freshDir()
        const tempFile = getDir+fileName
        const status = synthesizeSpeech(textToSpeech,tempFile,text.languageCode,text.voiceCode)
        console.log("stop here")
        if(status) return await s3.uploadFile(fileName,tempFile)
    }
}

async function synthesizeSpeech(textToSpeech,fileName,langCode,voiceCode) {
    if(!envs.azure) return
    const speechConfig = sdk.SpeechConfig.fromSubscription(azureConf.speechKey, azureConf.speechRegion)
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(fileName)
    speechConfig.speechSynthesisLanguage = langCode
    speechConfig.speechSynthesisVoiceName = voiceCode

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)
    synthesizer.speakTextAsync(
        textToSpeech,
        result => {
            synthesizer.close()
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                return true
            }
            else if(result.errorDetails){
                console.error(result.errorDetails)
            }
        },
        error => {
            console.error(error)
            synthesizer.close()
        });
    return null
}

const generateFileHash = async(message) =>{
    return sha1(message)+'.wav'
}

const freshDir = async() =>{
    const dir = 'temp_wav/'
    if(fs.existsSync(dir)){
       try{
           fs.rmSync(dir, { recursive: true })
       }catch (err){
           console.error(err)
       }
    }
    await fs.promises.mkdir(dir)
    return dir
}

//temp patch for text-to-speech
const getTextToSpeechAPI = async(textToSpeech) =>{
    const encodeString = new Buffer.from(textToSpeech).toString('base64')
    return 'https://voice.reverso.net/RestPronunciation.svc/v1/output=json/GetVoiceStream/voiceName=he-IL-Asaf?inputText='+encodeString
}

module.exports = {getSpeech}
