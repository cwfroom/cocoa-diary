'use strict'
// Node modules
const express = require('express')
const router = express.Router()

// Read config file, caching is fine
const config = require('../config.json')

router.post('/firstyear', (req, res) => {
    res.send({"FirstYear": config['FirstYear']})
})

router.post('/month', (req, res) => {
    
})

module.exports = router