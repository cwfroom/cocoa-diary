'use strict'
// Node modules
import express from 'express';
const router = express.Router();
import path from 'path';
import fs from 'fs';

// Read config file, caching is fine
import config from '../config.js'

let fileCache = {}

function twoDigits (value) {
    return ("0" + value).slice(-2)
}

function getFilePath (year, month) {
    return path.join(config.data['DataPath'], 'Diary', year.toString(), twoDigits(month) + '.json')
}

function openMonth (year, month, callback) {
    const filePath = getFilePath(year, month)
    fs.readFile(filePath,  (err, content) => {
        if (err) {
            const newMonth = {
                Year: year,
                Month: month,
                List: []
            }
            const yearPath = path.join(config.data['DataPath'], 'Diary', year.toString())
            if (!fs.existsSync(yearPath)){
                fs.mkdirSync(yearPath)
            }
            fs.writeFile(getFilePath(year, month), JSON.stringify(newMonth, null, '\t'), (err) => {
                if (err) {
                    console.log('Failed to create new month file')
                    console.log(err)
                } else {
                    openMonth(year, month, callback)
                }
            })
        }else{
            fileCache = JSON.parse(content)
            callback(fileCache)
        }
    })
}

function retrieveEntry(file, index, callback) {
    if (file['List'] && file['List'][index]){
        callback({'Content':file['List'][index]['Content']})
    }else{
        callback({'Content':''})
    }
}

function matchCache(year, month) {
    return (parseInt(year) === fileCache['Year'] && parseInt(month) === fileCache['Month'])
}

function updateList(file, changes, callback) {
    const index = changes['Index']
    const keys = ['Day', 'Title', 'Content']
    keys.forEach( key => {
        if (changes[key]) {
            if (!file['List'][index]) file['List'][index] = {}
            file['List'][index][key] = changes[key]
            if (key === 'Content') {
                file['List'][index]['Content'] = file['List'][index]['Content'].replace(/\r?\n/g, "\r\n")
            }
        }
    })
    
    const filePath = getFilePath(file['Year'], file['Month'])
    fs.writeFile(filePath, JSON.stringify(file, null, '\t'), (err) => {
        if (err) {
            callback({'Result': 'Error', 'Timestamp': Date.now() / 1000})
        }
        callback({'Result': 'Saved', 'Timestamp': Date.now() / 1000})
    })
}

function searchMonth(monthFile, keyword) {
    let result = []
    for (let i = 0; i < monthFile['List'].length; i++) {
        const entry = monthFile['List'][i]
        if (entry['Content']) {
            const keywordIndex = entry['Content'].indexOf(keyword)
            if (keywordIndex !== -1) {
                const digest = entry['Content'].substring(keywordIndex - 50, keywordIndex + 50)
                result.push({
                    'Date': monthFile['Year'].toString().substring(2) + twoDigits(monthFile['Month']) + twoDigits(entry['Day']),
                    'Title': entry['Title'],
                    'Digest': digest
                })
            }
        }
    }
    return result
}

router.post('/firstyear', (req, res) => {
    res.send({'FirstYear': config.data['FirstYear']})
})

router.post('/month', (req, res) => {
    const {year, month} = req.body
    openMonth(year, month, (file) => {
        if (file === '') {
            res.send(JSON.stringify({'Day': 0, 'Title': ''}))
        }else{
            const entryList = fileCache['List']
            let titleList = []
            for (let i = 0; i < entryList.length; i++) {
                const titleObj = {
                    'Day': entryList[i]['Day'],
                    'Title': entryList[i]['Title'] ? entryList[i]['Title'] : '',
                }
                titleList.push(titleObj)
            }
            res.send(JSON.stringify(titleList))
        }
    })
})

router.post('/entry', (req, res) => {
    const {year, month, index} = req.body
    if (matchCache(year, month)) {
        retrieveEntry(fileCache, index, (entry) => {
            res.send(JSON.stringify(entry))
        })
    }else{
        openMonth(year, month, (file) => {
            retrieveEntry(file, index, (entry) => {
                res.send(JSON.stringify(entry))
            })
        })
    }
})

router.post('/submit', (req, res) => {
    const {year, month, changes} = req.body
    if (matchCache(year, month)) {
        updateList(fileCache, changes, (result) => {
            res.send(JSON.stringify(result))
        })
    }else{
        openMonth(year, month, (file) => {
            updateList(file, changes, (result) => {
                res.send(JSON.stringify(result))
            })
        })
    }
})

router.post('/search', async (req, res) => {
    const {keyword} = req.body
    let result = []
    const filePaths = await fs.promises.readdir(path.join(config.data['DataPath'], 'Diary'), {recursive: true})
    for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i]
        const fullFilePath = path.join(config.data['DataPath'], 'Diary', filePath)
        const stat = await fs.promises.lstat(fullFilePath)
        if (stat.isFile()) { 
            await fs.promises.readFile(fullFilePath).then( (content) => {
                const monthFile = JSON.parse(content)
                result = result.concat(searchMonth(monthFile, keyword))
            })
        }
    }
    res.send(JSON.stringify(result))
})


export default router