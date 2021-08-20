'use strict'
// Node modules
const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const { db } = require('../db')

// Read config file, caching is fine
const config = require('../config.json')

router.post('/upload', (req, res) => {
    fs.readdir(config['DataPath'], (err, dirs) => {
        if (err) return console.log(err)
        dirs.forEach( (dir) => {
            if (dir !== 'logbook') {
                fs.readdir(path.resolve(config['DataPath'], dir), (err, months) => {
                    if (err) return console.log(err)
                    months.forEach( (month) => {
                        fs.readFile(path.resolve(config['DataPath'], dir, month), (err, content) => {
                            const parsed = JSON.parse(content)
                            db.getInstance().updateMonth(parsed['Year'], parsed['Month'], parsed['List'])
                        })
                    })
                })
            }else{
                fs.readdir(path.resolve(config['DataPath'], dir), (err, logbooks) => {
                    if (err) return console.log(err)
                    logbooks.forEach( (logbook) => {
                        if (logbook !== 'index.zzd') {
                            fs.readFile(path.resolve(config['DataPath'], dir, logbook), (err, content) => {
                                const parsed = JSON.parse(content)
                                db.getInstance().updateLogbook(parsed['Category'], parsed['Columns'], parsed['List'])
                            })
                        }
                    })
                })
            }
        })
    })
})

router.post('/download', (req, res) => {

})

module.exports = router