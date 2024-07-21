'use strict'
const path = require('path')
const fs = require('fs')

const logbookPath = '../server/data/logbook'
let logbookObj = JSON.parse(fs.readFileSync(path.resolve(logbookPath, 'Anime.json'), {encoding: 'utf-8'}))
let list = logbookObj['List']

//Define and populate seasons
let releaseSeasons = []
for (let year = 2023; year >= 2006; year--) {
    releaseSeasons.push(`${year}秋`)
    releaseSeasons.push(`${year}夏`)
    releaseSeasons.push(`${year}春`)
    releaseSeasons.push(`${year}冬`)
}

const segregatedList = {}
segregatedList['Older'] = []
for (let i = 0; i < list.length; i++) {
    const release = list[i]['Release']
    if (releaseSeasons.includes(release)) {
        if (!segregatedList[release]) {
            segregatedList[release] = []
        }
        delete list[i]['Release']
        segregatedList[release].push(list[i])
    }else {
        segregatedList['Older'].push(list[i])
    }
}

logbookObj['List'] = segregatedList
fs.writeFileSync('Anime.json', JSON.stringify(logbookObj, null, '\t'))