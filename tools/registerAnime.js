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
    "Watched": 12
    "Date": Date
}
*/

const inputFileName = "registerAnimeInput.txt"
const outputFileName = "registerAnimeOutput.json"

let lines = fs.readFileSync(path.resolve(__dirname, inputFileName), {encoding: "utf-8"}).split('\r\n')

const release = lines[0]
let result = []
for (let i = 1; i < lines.length; i++)
{
    let line = lines[i]
    if (line.length > 1){
        let lineParts = line.split(/\s/)
        if (lineParts.length === 4)
        {
            let episodes = lineParts[2].replace('終', '')
            result.push({
                "Title": lineParts[1],
                "Release": release,
                "Total": episodes,
                "Watched": episodes,
                "Date": lineParts[3]
            })
        }else
        {
            //Print to handle manually
            console.log(lineParts)
        }

    }
}

fs.writeFileSync(path.resolve(__dirname, outputFileName), JSON.stringify(result, null, 4))