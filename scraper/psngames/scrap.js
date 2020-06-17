'use strict'
const path = require('path')
const fs = require('fs')
const rp = require('request-promise')
const puppeteer = require('puppeteer-core')
const cheerio = require('cheerio')
const appdata = require('./appdata.json')

let locale, doParseAll
let browser, listPage
let list, knownTitles

async function connectChrome () {
    let debugInfo
    try {
        debugInfo = await rp('http://localhost:9222/json/version')
    }catch (err) {
        console.log('Make sure to start chrome in debug mode first')
        process.exit()
    }
    
    const { webSocketDebuggerUrl } = JSON.parse(debugInfo)
    browser = await puppeteer.connect({browserWSEndpoint: webSocketDebuggerUrl})
    listPage = await browser.newPage()
    await listPage.goto(appdata[locale].ListURL, { waituntil:'domcontentloaded' })
}

async function parseList () {
    list = []
    if (!doParseAll) {
        let prevFile = JSON.parse(fs.readFileSync(appdata[locale].Output, {encoding:'utf-8'}))
        list = prevFile.List.reverse()
        knownTitles = []
        list.forEach(item => {
            knownTitles.push(item['Title'])
        })
    }
    await listPage.waitForSelector('div.download-list')
    let html = await listPage.content()
    while (hasNext(html)) {
        const nextPageNav = await listPage.$('.download-top-controls .paginator-control__next')
        const pageResult = parsePage(html)
        list = list.concat(pageResult.result)
        if (pageResult.stop) break
        if (nextPageNav) {
            await nextPageNav.click()
            await listPage.waitForSelector('div.download-list')
            html = await listPage.content()
        } else {
            break
        }
    }
    const result = {
        "Category": `PSN${locale}`,
        "Columns": ['Title', 'Platform', 'Status'],
        "List": list.reverse()
    }
    
    fs.writeFile(appdata[locale].Output, JSON.stringify(result, null, '\t'), err => {
        if (err) console.log(err)
    })
}

function hasNext(html) {
    const $ = cheerio.load(html)
    if ($('.paginator-control__next', '.download-top-controls').hasClass('paginator-control__arrow-navigation--disabled')) {
        return false
    }else{
        return true
    }
}

function includesIgnore(title, locale) {
    const list = appdata[locale].IgnoreList
    for (let i = 0; i < list.length; i++) {
        if (title.includes(list[i])) return true
    }
    return false
}

function filterPlatform(platform) {
    if (platform.length > 1 ) {
        if (platform.includes('PSP')) {
            return 'PSP'
        }else if (platform.includes('PS Vita')) {
            return 'PS Vita'
        }
    }else{
        return platform[0]
    }
}

function parsePage (html) {
    let result = []
    let stopParsing = false
    const $ = cheerio.load(html)
    // $().each doesn't work with await call?
    for ( let i = 0; i < $('.download-list-item').length; i++) {
        const element = $('.download-list-item').get(i)
        const type = $('.download-list-item__metadata', element).text()
        const title = $('.download-list-item__title', element).text().trim()
        // Halt when encoutering a known title
        if (!doParseAll && knownTitles.includes(title)) {
            stopParsing = true
            break
        }
        // Only interested in games. It's impossible to filter every title, manual edit is still required.
        if (type.includes(appdata[locale].Game) && !includesIgnore(title, locale)) {
            // In case of multiple Platform
            let platform = []
            $('a', '.download-list-item__playable-on-info', element).each( (index, element) => {
                platform.push($(element).text())
            })
            // Only interested in the real playable platform
            platform = filterPlatform(platform)
            console.log(`${title} ${platform}`)
            result.push({
                'Title': title,
                'Platform': platform,
                'Status': ''
            })
        }
    }
    return {
        result: result,
        stop: stopParsing
    }
}

async function handler () {
    locale = process.argv[2].toUpperCase()
    if (!appdata[locale]) {
        console.log('Region undefined or unsupported region')
        return
    }
    doParseAll = process.argv[3]==='all' ? true : false
    await connectChrome()
    await parseList()
    await listPage.close()
    process.exit()
}

handler()

