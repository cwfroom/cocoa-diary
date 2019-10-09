'use strict'
// Node modules
const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

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

// Routing
app.use('/api/diary', diary)
app.use('/api/logbook', logbook)
app.use('/api/user', user)