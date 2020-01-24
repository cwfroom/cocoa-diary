'use strict'
// Node modules
const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const exjwt = require('express-jwt')
const date = new Date()

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

function deleteEntry (index) {
    fileCache['List'].splice(index, 1)
}

function insertEntry (index) {
    fileCache['List'].splice(index, 0, {})
}

function sendResult(res, success) {
    if (success) {
        res.send({'Result': 'Saved', 'Timestamp': date.getTime() / 1000})
    }else{
        res.send({'Result': 'Error', 'Timestamp': date.getTime() / 1000})
    }
}

router.post('/index', (req, res) => {
    const fileIndex = fs.readFileSync(path.join(config['DataPath'], 'logbook', 'index.zzd'), 'utf-8')
    res.send(fileIndex)
})

router.post('/category', (req, res) => {
    const {category} = req.body
    checkCache(category)
    res.send(JSON.stringify(fileCache))
})

function generalHandler (req, res, handler, key) {
    const { category } = req.body
    const data = req.body[key]
    try {
        checkCache(category)
        handler(data)
        saveFile()
        sendResult(res, true)
    } catch (err) {
        console.log(err)
        sendResult(res, false)
    }
}

router.post('/submit', checkToken, (req, res) => {
    generalHandler(req, res, updateEntry, 'changes')
})

router.post('/delete', checkToken, (req, res) => {
    generalHandler(req, res, deleteEntry, 'index')
})

router.post('/insert', checkToken, (req, res) => {
    generalHandler(req, res, insertEntry, 'index')
})

// Force reload, mainly for debug purpose
router.post('/reload', (req, res) => {
    const {category} = req.body
    fileCache = JSON.parse(fs.readFileSync(getFilePath(category), 'utf8'))
    res.send(JSON.stringify(fileCache))
})


module.exports = router