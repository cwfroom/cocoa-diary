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
    let logbookObj = JSON.parse(fs.readFileSync(path.resolve(logbookPath, targetFile + '.json'), {encoding: 'utf-8'}))
    const subFolder = path.resolve(logbookPath, targetFile)
    let list = logbookObj['List']

    logbookObj['List'] = {
        "Default" : list
    }

    fs.writeFileSync(
        path.resolve(logbookPath, targetFile+'.json'),
        JSON.stringify(logbookObj, null, '\t')
    )
}