'use strict'
// Node modules
import express from 'express';
const router = express.Router();
import path from 'path';
import fs from 'fs';

// Read config file, caching is fine
import config from '../config.js'

let fileCache = {}

function getFilePath (name) {
    return path.join(config.data['DataPath'], 'logbook', name + '.json')
}

function getNotesPath (alias) {
    return path.json(config.data['DataPath', 'logbook', fileCache['Category'], alias + '.json'])
}

function checkCache (category) {
    if (fileCache['Category'] !== category){
        fileCache = JSON.parse(fs.readFileSync(getFilePath(category), 'utf8'))
    }
}

function saveFile () {
    const filePath = getFilePath(fileCache['Category'])
    fs.writeFileSync(filePath, JSON.stringify(fileCache, null, '\t'))
}

function updateEntry (changes) {
    const index = changes['Index']
    let list = fileCache['List']
    const keys = fileCache['Columns']
    keys.forEach( key => {
            if (changes[key]) {
                if (!list[index]) list[index] = {}
                list[index][key] = changes[key]
            }
    })
    // Handle notes change
    if (changes['Notes']) {
        // Alias change
        if (changes['Alias']) {
            // Rename file if exists
            if (list[index]['Alias'] && fs.existsSync(getNotesPath(list[index]['Alias']))) {
                fs.renameSync(getNotesPath(list[index]['Alias']), getNotesPath(changes['Alias']))
            }
            list[index]['Alias'] = changes['Alias']
        }
            updateNotes(list[index]['Alias'], changes['Notes'])
    }
    fileCache['List'] = list
}

function getNotes (alias) {
    const notesPath = getNotesPath(alias)
    const notesObj = JSON.parse(fs.readFileSync(notesPath, {encoding: 'utf-8'}))
    return notesObj
}

function updateNotes (alias, notes) {
    const notesPath = getNotesPath(alias)
    const notesObj = {
        'Alias': alias,
        'Notes': notes
    }
    fs.writeFileSync(notesPath, JSON.stringify(notesObj, null, '\t'))
}

function deleteEntry (index) {
    fileCache['List'].splice(index, 1)
}

function insertEntry (index) {
    fileCache['List'].splice(index, 0, {})
    const notespath = getNotesPath(fileCache['List'][index]['Alias'])
    fs.unlinkSync(notespath)
}

function swapEntry (index) {
    let temp = fileCache['List'][index[0]]
    fileCache['List'][index[0]] = fileCache['List'][index[1]]
    fileCache['List'][index[1]] = temp
 }

function sendResult(res, success) {
    if (success) {
        res.send({'Result': 'Saved', 'Timestamp': Date.now() / 1000})
    }else{
        res.send({'Result': 'Error', 'Timestamp': Date.now() / 1000})
    }
}

router.post('/index', (req, res) => {
    const fileIndex = fs.readFileSync(path.join(config.data['DataPath'], 'logbook', 'index.json'), 'utf-8')
    res.send(fileIndex)
})

router.post('/category', (req, res) => {
    const {category} = req.body
    checkCache(category)
    res.send(JSON.stringify(fileCache))
})

function generalHandler (req, res, handler, key) {
    const { category } = req.body
    const data = req.body[key]
    try {
        checkCache(category)
        handler(data)
        saveFile()
        sendResult(res, true)
    } catch (err) {
        console.log(err)
        sendResult(res, false)
    }
}

router.post('/submit', (req, res) => {
    generalHandler(req, res, updateEntry, 'changes')
})

router.post('/delete', (req, res) => {
    generalHandler(req, res, deleteEntry, 'index')
})

router.post('/insert', (req, res) => {
    generalHandler(req, res, insertEntry, 'index')
})

router.post('/swap', (req, res) => {
    generalHandler(req, res, swapEntry, 'index')
})

router.post('/notes', (req, res) => {
    const alias = req.body['Alias']
    try {
        const notesObj = getNotes(alias)
        res.send(notesObj)
    }catch(err) {
        console.log(err)
        res.send(err)
    }
})

// Force reload, mainly for debug purpose
router.post('/reload', (req, res) => {
    const {category} = req.body
    fileCache = JSON.parse(fs.readFileSync(getFilePath(category), 'utf8'))
    res.send(JSON.stringify(fileCache))
})


export default router