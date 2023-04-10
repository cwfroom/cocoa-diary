'use strict'
// Node modules
import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import sha256 from 'js-sha256';

// Read config file, caching is fine
import config from '../config.js'

router.post('/login', (req, res) => {
    const { password } = req.body
    if (sha256(password) === config.data['Password']){
        const token = jwt.sign({
            username: 'admin'
        },
        config.data['Secret'],
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

export default router
