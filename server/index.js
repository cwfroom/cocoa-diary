'use strict'
// Node modules
const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const exjwt = require('express-jwt')

// Custom modules
const diary = require('./routes/diary')
const logbook = require('./routes/logbook')
const user = require('./routes/user')

// Read config file, caching is fine
const config = require('./config.json')

const app = express()
const port = 2638
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

const checkToken = exjwt({
    secret: config['Secret']
})

// Routing
app.use('/api/diary', checkToken, diary)
app.use('/api/logbook', checkToken, logbook)
app.use('/api/user', user)