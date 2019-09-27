'use strict'
// Node modules
const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

// Read config file, caching is fine
const config = require('../config.json')

let fileCache = {}

function getFilePath (name) {
    return path.join(config['DataPath'], 'logbook', name + '.zzd')
}

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

router.post('/submit', (req, res) => {
    const {category, changes} = req.body
    if (fileCache['Category'] === category){

    }else{

    }
})

module.exports = router