'use strict'
const path = require('path')
const fs = require('fs')
/*
Convert anime watching record in well-formatted plain text to json objects.

Input format
2023春
月
2400 AnimeTitle 12 Date

Output format
{
    "Title": "AnimeTitle",
    "Release": "2023春",
    "Total": "12"
    "Watched": "12",
    "AirDay": "月",
    "AirTime": "2200",
    "Date": Date
}
*/

const inputFileName = "registerAnimeInput.txt"
const outputFileName = "registerAnimeOutput.json"

let lines = fs.readFileSync(path.resolve(__dirname, inputFileName), {encoding: "utf-8"}).split('\r\n')

const release = lines[0].replace('アニメ', '')
let result = []
let airDay = ''
for (let i = 1; i < lines.length; i++)
{
    let line = lines[i]
    if (lines[i].length === 1) {
        airDay = lines[i]
    }else {
        let lineParts = line.split(/\s/)
        let hasDate = lineParts[lineParts.length-1].length === 8
        let titleArr = []
        for (let i = 1; i < lineParts.length - 2; i++) {
            titleArr.push(lineParts[i])
        }
        let date = ""
        let episodes = ""
        if (!hasDate) {
            titleArr.push(lineParts[lineParts.length - 2])
            episodes = lineParts[lineParts.length - 1].replace('終', '')
        }else {
            date = lineParts[lineParts.length - 1]
            episodes = lineParts[lineParts.length - 2].replace('終', '')
        }
        const title = titleArr.join(' ')

        result.push({
                "Title": title,
                "Release": release,
                "Total": '12',
                "Watched": episodes,
                "AirDay": airDay,
                "AirTime": lineParts[0],
                "Date": date
        })

    }
}

const wrapped = {[release] : result}
fs.writeFileSync(path.resolve(__dirname, outputFileName), JSON.stringify(wrapped, null, 4))