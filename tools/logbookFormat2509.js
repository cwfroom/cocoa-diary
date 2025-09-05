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
    console.log(logbookObj)
    let list = logbookObj['List']
    let segments = Object.keys(list)
    console.log(segments)
    logbookObj['Segments'] = segments
    let listArr = []
    for (let i = 0; i < segments.length; i++) {
        listArr.push(list[segments[i]])
    }
    logbookObj['List'] = listArr

    fs.writeFileSync(
        path.resolve(__dirname, 'converted', targetFile+'.json'),
        JSON.stringify(logbookObj, null, '\t')
    )
}