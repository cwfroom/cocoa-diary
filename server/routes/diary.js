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

function getFilePath (year, month) {
    return path.join(config['DataPath'], year.toString(), twoDigits(month) + '.zzd')
}

function openMonth (year, month, callback) {
    const filePath = getFilePath(year, month)
    fs.readFile(filePath,  (err, content) => {
        if (err) {
            const newMonth = {
                Year: year,
                Month: month,
                List: []
            }
            fs.writeFile(getFilePath(year, month), JSON.stringify(newMonth), (err) => {
                console.log('Failed to create new month file')
            })
            callback('')
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
        callback({'Content':''})
    }
}

function matchCache(year, month) {
    return (parseInt(year) === fileCache['Year'] && parseInt(month) === fileCache['Month'])
}

function updateList(file, changes, callback) {
    let list = file['List']
    const indices = Object.keys(changes)
    const keys = ['Day', 'Title', 'Content']
    indices.forEach(index => {
        if (!(index in list)) {
            list[index] = {}
        }
        keys.forEach(key => {
            if (changes[index][key]) {
                list[index][key] = changes[index][key]
                // To keep files compatible with zzDiary editor
                if (key === 'Content') {
                    list[index]['Content'] = list[index]['Content'].replace(/\r?\n/g, "\r\n")
                }
            }
        })
    })
    file['List'] = list
    const filePath = getFilePath(file['Year'], file['Month'])
    fs.writeFile(filePath, JSON.stringify(file), (err) => {
        if (err) {
            callback({'Result': 'Error'})
        }
        callback({'Result': 'Saved'})
    })
}

router.post('/firstyear', (req, res) => {
    res.send({'FirstYear': config['FirstYear']})
})

router.post('/month', (req, res) => {
    const {year, month} = req.body
    openMonth(year, month, (file) => {
        if (file === '') {
            res.send(JSON.stringify({'Day': 0, 'Title': ''}))
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
    if (matchCache(year, month)) {
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

router.post('/submit', (req, res) => {
    const {year, month, changes} = req.body
    if (matchCache(year, month)) {
        updateList(fileCache, changes, (result) => {
            res.send(JSON.stringify(result))
        })
    }else{
        openMonth(year, month, (file) => {
            updateList(file, changes, (result) => {
                res.send(JSON.stringify(result))
            })
        })
    }
})


module.exports = router