'use strict'
const path = require('path')
const fs = require('fs')

const diaryPath = '../server/data'
if (!fs.existsSync(path.resolve(diaryPath, 'Diary'))) {
    fs.mkdirSync(path.resolve(diaryPath, 'Diary'))
}

function twoDigits (num) {
    return ('0' + num).slice(-2)
}

for (let year = 2002; year <= 2023; year++) {
    for (let month = 1; month <=12; month++) {
        const monthPath = path.resolve(diaryPath, year + '', twoDigits(month) + '.zzd')
        if (fs.existsSync(monthPath)) {
            const newYearPath = path.resolve(diaryPath, 'Diary', year + '')
            if (!fs.existsSync(newYearPath)) {
                fs.mkdirSync(newYearPath)
            }
            const newMonthPath = path.resolve(newYearPath , twoDigits(month) + '.json')
            const diaryObj = JSON.parse(fs.readFileSync(monthPath, {encoding: 'utf-8'}))
            fs.writeFileSync(newMonthPath, JSON.stringify(diaryObj, null, '\t'))
            console.log(`Moved from ${monthPath} to ${newMonthPath}`)
        }
}
}