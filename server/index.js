'use strict'
// Node modules
const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const basicAuth = require('express-basic-auth')

// Custom modules
const diary = require('./routes/diary')

// Read config file, caching is fine
const config = require('./config.json')

const app = express()
const port = 2638
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
/*
app.use(basicAuth({
    users: {
        'admin': config['Password']
    },
    challenge: true
}))
*/

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

// Routing
app.use('/diary', diary)
