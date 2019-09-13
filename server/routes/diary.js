'use strict'
// Node modules
const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

// Read config file, caching is fine
const config = require('../config.json')

let fileCache = {}

function twoDigits (value) {
    return ("0" + value).slice(-2)
}

function openMonth (res, year, month) {
    const filePath = path.join(config['DataPath'], year.toString(), twoDigits(month) + '.zzd')
    fs.readFile(filePath,  (err, content) => {
        if (err) {
            res.send(JSON.stringify({}))
        }else{
            fileCache = JSON.parse(content)
            const entryList = fileCache['List']
            let titleList = []
            for (let i = 0; i < entryList.length; i++) {
                const titleObj = {
                    'Index': i,
                    'Day': entryList[i]['Day'],
                    'Title': entryList[i]['Title'],
                }
                titleList.push(titleObj)
            }
            res.send(JSON.stringify(titleList))
        }
    })
}

function parseFile (raw, callback) {
    const titleList = []
    for (let i = 0; i < raw.length; i++) {
        const entry = 
        titleList[day] = entry['Title']
    }
    callback(titleList)
}

function retrieveEntry(res, date) {

}

router.post('/firstyear', (req, res) => {
    res.send({'FirstYear': config['FirstYear']})
})

router.post('/month', (req, res) => {
    const {year, month} = req.body
    openMonth(res, year, month)
})

module.exports = router