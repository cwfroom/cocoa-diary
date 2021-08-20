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
const tools = require('./routes/tools')

// Read config file, caching is fine
const config = require('./config.json')

const app = express()
const port = 2638
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`Data path: ${config['DataPath']}`)
    console.log(`Listening on port ${port}`)
})

const checkToken = exjwt({
    secret: config['Secret'],
    algorithms: ["HS256"]
})

// Routing
app.use('/api/diary', checkToken, diary)
app.use('/api/logbook', checkToken, logbook)
app.use('/api/user', user)
app.use('/api/tools', tools)