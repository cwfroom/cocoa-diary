'use strict'
// Node modules
import express from 'express'
import cors from 'cors'
import { expressjwt } from 'express-jwt'
import bodyParser from 'body-parser'
// Custom modules
import diary from './routes/diary.js';
import logbook from './routes/logbook.js';
import user from './routes/user.js';
import tools from './routes/tools.js';
// Read config file, caching is fine
import config from './config.js'

const app = express()
const port = 2638
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`Data path: ${config.data['DataPath']}`)
    console.log(`Listening on port ${port}`)
})

const checkToken = expressjwt({
    secret: config.data['Secret'],
    algorithms: ["HS256"]
})

// Routing
app.use('/api/diary', checkToken, diary)
app.use('/api/logbook', checkToken, logbook)
app.use('/api/user', user)
app.use('/api/tools', tools)