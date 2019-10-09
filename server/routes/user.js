'use strict'
// Node modules
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const sha256 = require('js-sha256')

// Read config file, caching is fine
const config = require('../config.json')

router.post('/login', (req, res) => {
    const { password } = req.body
    if (sha256(password) === config['Password']){
        const token = jwt.sign({
            username: 'admin'
        },
        'Hot Cocoa',
        {
            expiresIn: '7d'
        })
        res.json({
            status: 0,
            token
        })
    }else {
        res.json({status: 1})
    }
})

module.exports = router
