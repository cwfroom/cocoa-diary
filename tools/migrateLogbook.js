'use strict'
const path = require('path')
const fs = require('fs')

const logbookPath = '../server/data/logbook'
const indexFile = JSON.parse(fs.readFileSync(path.resolve(logbookPath, 'index.json')))
indexFile.forEach(targetfile => {
    handleLogbook(targetfile)
})

function handleLogbook(targetFile) {
    console.log('Logbook: ' + targetFile)
    let logbookObj = JSON.parse(fs.readFileSync(path.resolve(logbookPath, targetFile + '.zzd'), {encoding: 'utf-8'}))
    const subFolder = path.resolve(logbookPath, targetFile)
    let list = logbookObj['List']
    
    for (let i = 0; i < list.length; i++) {
        if (list[i]['Comments']) {
            let alias = list[i]['Title'].replace(/[<>:"/\\|?*\s]/g, "").slice(0, 20)
            console.log(`Alias: ${alias}`)
            
            if (!fs.existsSync(subFolder)) {
                fs.mkdirSync(subFolder)
            }
            let noteObj = {
                'Alias': alias,
                'Notes': list[i]['Comments']
            }
            fs.writeFileSync(
                path.resolve(subFolder, alias+'.json'),
                JSON.stringify(noteObj, null, '\t')
            )
            list[i]['Alias'] = alias
            delete list[i]['Comments']
        }
    }
    
    logbookObj['List'] = list
    fs.writeFileSync(
        path.resolve(logbookPath, targetFile+'.json'),
        JSON.stringify(logbookObj, null, '\t')
    )
}