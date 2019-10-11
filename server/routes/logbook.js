'use strict'
// Node modules
const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const exjwt = require('express-jwt')
const moment = require('moment')

// Read config file, caching is fine
const config = require('../config.json')

let fileCache = {}

function getFilePath (name) {
    return path.join(config['DataPath'], 'logbook', name + '.zzd')
}

const checkToken = exjwt({
    secret: config['Secret']
})

function checkCache (category) {
    if (fileCache['Category'] !== category){
        fileCache = JSON.parse(fs.readFileSync(getFilePath(category), 'utf8'))
    }
}

function saveFile () {
    const filePath = getFilePath(fileCache['Category'])
    fs.writeFileSync(filePath, JSON.stringify(fileCache))
}

function updateEntry (changes) {
    const index = changes['Index']
    let list = fileCache['List']
    const keys = fileCache['Columns']
    keys.forEach( key => {
            if (changes[key]) {
                if (!list[index]) list[index] = {}
                list[index][key] = changes[key]
            }
    })
    fileCache['List'] = list
}

function deleteEntry ( index ) {
    let list = fileCache['List']
    list.splice(index, 1)
    fileCache['List'] = list
}

function sendResult(res, success) {
    if (success) {
        res.send(JSON.stringify({Result:'Saved ' + moment().format('YYYY/MM/DD HH:mm:ss')}))
    }else{
        res.send(JSON.stringify({Result:'Error'}))
    }
}

router.post('/index', (req, res) => {
    fs.readdir(path.join(config['DataPath'], 'logbook'), (err, files) => {
        if (err) res.send('[]')
        files.forEach( (filename, index) => {
            // Remove file extensions
            files[index] = filename.replace(/\.[^/.]+$/, "")
        })
        res.send(JSON.stringify(files))
    })
})

router.post('/category', (req, res) => {
    const {category} = req.body
    checkCache(category)
    res.send(JSON.stringify(fileCache))
})

router.post('/submit', checkToken, (req, res) => {
    const {category, changes} = req.body
    try {
        checkCache(category)
        updateEntry(changes)
        saveFile()
        sendResult(res, true)
    } catch (err) {
        console.log(err)
        sendResult(res, false)
    }
})

router.post('/delete', checkToken, (req, res) => {
    const { category, index } = req.body
    try {
        checkCache(category)
        deleteEntry(index)
        saveFile()
        sendResult(res, true)
    } catch (err) {
        console.log(err)
        sendResult(res, false)
    }
})

// Force reload, mainly for debug purpose
router.post('/reload', (req, res) => {
    const {category} = req.body
    openCategory (category, (file) => {
        res.send(JSON.stringify(file))
    })
})


module.exports = router