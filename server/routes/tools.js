'use strict'
// Node modules
import express from 'express';
const router = express.Router();
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';

// Read config file, caching is fine
import config from '../config.js'

router.post('/download', (req, res) => {
    const archive = archiver('zip')
    archive.directory(config.data['DataPath'])
    archive.finalize()
    archive.pipe(res)
})

export default router