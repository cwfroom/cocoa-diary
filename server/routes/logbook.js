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

function openCategory (category, callback) {
    fs.readFile(getFilePath(category), (err, content) => {
        if (err) callback('{}')
        fileCache = JSON.parse(content)
        callback(fileCache)
    })
}

function matchCache (category) {
    return fileCache['Category'] === category
}

function updateList (file, changes, callback) {
    const index = changes['Index']
    let list = file['List']
    const keys = file['Columns']
    keys.forEach( key => {
            if (changes[key]) {
                if (!list[index]) list[index] = {}
                list[index][key] = changes[key]
            }
    })
    file['List'] = list
    const filePath = getFilePath(file['Category'])
    fs.writeFile(filePath, JSON.stringify(file), (err) => {
        if (err) {
            callback({'Result': 'Error'})
        }
        callback({'Result': 'Saved ' + moment().format('YYYY/MM/DD HH:mm:ss Z')})
    })
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
    if (matchCache(category)){
        res.send(JSON.stringify(fileCache))
    }else{
        openCategory (category, (file) => {
            res.send(JSON.stringify(file))
        })
    }
})

router.post('/submit', checkToken, (req, res) => {
    const {category, changes} = req.body
    if (matchCache(category)){
        updateList(fileCache, changes, (result) => {
            res.send(JSON.stringify(result))
        })
    }else{
        openCategory(category, (file) => {
            updateList(file, changes, (result) => {
                res.send(JSON.stringify(result))
            })
        })
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