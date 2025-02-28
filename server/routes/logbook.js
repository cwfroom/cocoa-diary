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
    return path.join(config.data['DataPath'], 'Logbook', name + '.json')
}

function getNotesPath (alias) {
    return path.join(config.data['DataPath'], 'Logbook', fileCache['Category'], alias + '.json')
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
    const { segment, index } = changes.locator 
    let list = fileCache['List']
    const keys = fileCache['Columns']
    keys.forEach( key => {
            if (changes[key] !== undefined) {
                if (!list[segment][index]) list[segment][index] = {}
                list[segment][index][key] = changes[key]
            }
    })
    // Handle notes change
    if (changes['Notes']) {
        // Alias change
        if (changes['Alias']) {
            // Rename file if exists
            if (list[segment][index]['Alias'] && fs.existsSync(getNotesPath(list[segment][index]['Alias']))) {
                fs.renameSync(getNotesPath(list[segment][index]['Alias']), getNotesPath(changes['Alias']))
            }
            list[segment][index]['Alias'] = changes['Alias']
        }
            updateNotes(list[segment][index]['Alias'], changes['Notes'])
    }
    fileCache['List'] = list
    return `Updated ${segment} Index ${index}`
}

function readNotes (alias) {
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

function deleteEntry (locator) {
    const { segment, index } = locator
    if (fileCache['List'][segment][index]['Alias']) {
        const notespath = getNotesPath(fileCache['List'][segment][index]['Alias'])
        fs.unlinkSync(notespath)
    }
    fileCache['List'][segment].splice(index, 1)
    return `Deleted ${segment} Index ${index}`
}

function insertEntry (locator) {
    const { segment, index } = locator
    fileCache['List'][segment].splice(index, 0, {})
    return `Inserted ${segment} Index ${index}`
}

function swapEntry (locator) {
    const { segment, index } = locator
    let temp = fileCache['List'][segment][index[0]]
    fileCache['List'][segment][index[0]] = fileCache['List'][segment][index[1]]
    fileCache['List'][segment][index[1]] = temp
    return `Swapped ${segment} Index ${index[0]} and ${index[1]}` 
}

function pinEntry(locator) {
    const { segment, index } = locator
    let temp = fileCache['List'][segment].splice(index, 1)[0]
    fileCache['List'][segment].unshift(temp)
    return `Pinned ${segment} Index ${index}`
}

function sendResult(res, success, message) {
    if (success) {
        res.send({'Result': message, 'Timestamp': Date.now() / 1000})
    }else{
        res.send({'Result': 'Error', 'Timestamp': Date.now() / 1000})
    }
}

router.post('/index', (req, res) => {
    const fileIndex = fs.readFileSync(path.join(config.data['DataPath'], 'Logbook', 'index.json'), 'utf-8')
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
        const message = handler(data)
        saveFile()
        sendResult(res, true, message)
    } catch (err) {
        console.log(err)
        sendResult(res, false, '')
    }
}

router.post('/submit', (req, res) => {
    generalHandler(req, res, updateEntry, 'changes')
})

router.post('/delete', (req, res) => {
    generalHandler(req, res, deleteEntry, 'locator')
})

router.post('/insert', (req, res) => {
    generalHandler(req, res, insertEntry, 'locator')
})

router.post('/swap', (req, res) => {
    generalHandler(req, res, swapEntry, 'locator')
})

router.post('/pin', (req, res) => {
    generalHandler(req, res, pinEntry, 'locator')
})

router.post('/notes', (req, res) => {
    const { category, alias } = req.body
    checkCache(category)
    try {
        const notesObj = readNotes(alias)
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