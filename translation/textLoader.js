const fs = require('fs');

const getTranslation = async(lang) => {
    try{
        if (fs.existsSync('./translation/'+lang+'.json')){
            const languageFile = fs.readFileSync('./translation/'+lang+'.json','utf8')
            return JSON.parse(languageFile)
        }
        else{
            console.error("Language isn't found - return default")
            return fs.readFileSync('./translation/en-US.json', 'utf8')
        }
    }catch (err){
        console.error(err)
    }
}

module.exports = getTranslation
