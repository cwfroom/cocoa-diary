'use strict'
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

function updateList (list, title, region, platform, status) {
    let inList = false
    for (let i = 0; i < list.length; i++) {
        if (list[i].Title.includes(title)) {
            inList = true
            list[i].Region = region
            list[i].Status = status
        }
    }
    if (!inList) {
        list.unshift({
            Title: title,
            Region: region,
            Platform: platform,
            Release: '',
            Media: '',
            Status: status
        })
    }
    return list
}

function parsePage (html, list) {
    const $ = cheerio.load(html)
    $('tr', '#gamesTable').each( (index, element) => {
        let status = 'Listed'
        if ($(element).hasClass('platinum')){
            status = 'Platinum'
        }else if ($(element).hasClass('completed')){
            status = 'Completed'
        }
        const title = $('.title', element).text()
        const ellipsis = $('.ellipsis', element).text().trim()
        let region = ''
        if (title !== ellipsis) {
            region = ellipsis.split('•')[1].trim()
        }
        let platform = []
        $('span','div.platforms', element).each( (index, element) => {
            platform.push($(element).text())
        })
        platform = platform.join(', ')
        //console.log(`${title}|${region}|${platform}|${status}`)
        list = updateList(list, title, region, platform, status)
    })
    return list
}

function handler () {
    let file = JSON.parse(fs.readFileSync(path.join(__dirname, 'PSN.zzd')))
    const html = fs.readFileSync(path.join(__dirname, 'psnprofiles.html'))
    let list = file.List
    list = parsePage(html, list)
    file.List = list
    console.log(file)
    fs.writeFileSync(path.join(__dirname, 'PSN.zzd'), JSON.stringify(file))
}

handler ()