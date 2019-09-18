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

function openMonth (year, month, callback) {
    const filePath = path.join(config['DataPath'], year.toString(), twoDigits(month) + '.zzd')
    fs.readFile(filePath,  (err, content) => {
        if (err) {
            callback({})
        }else{
            fileCache = JSON.parse(content)
            callback(fileCache)
        }
    })
}

function retrieveEntry(file, index, callback) {
    if (file['List'] && file['List'][index]){
        callback({'Content':file['List'][index]['Content']})
    }else{
        callback({})
    }
}

router.post('/firstyear', (req, res) => {
    res.send({'FirstYear': config['FirstYear']})
})

router.post('/month', (req, res) => {
    const {year, month} = req.body
    openMonth(year, month, (file) => {
        if (file === {}) {
            res.send('Error')
        }else{
            const entryList = fileCache['List']
            let titleList = []
            for (let i = 0; i < entryList.length; i++) {
                const titleObj = {
                    'Day': entryList[i]['Day'],
                    'Title': entryList[i]['Title'],
                }
                titleList.push(titleObj)
            }
            res.send(JSON.stringify(titleList))
        }
    })
})

router.post('/entry', (req, res) => {
    const {year, month, index} = req.body
    if (parseInt(year) === fileCache['Year'] && parseInt(month) === fileCache['Month']) {
        retrieveEntry(fileCache, index, (entry) => {
            res.send(JSON.stringify(entry))
        })
    }else{
        openMonth(year, month, (file) => {
            retrieveEntry(file, index, (entry) => {
                res.send(JSON.stringify(entry))
            })
        })
    }
})

module.exports = router