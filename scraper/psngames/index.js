'use strict'
const path = require('path')
const fs = require('fs')
const util = require('util')
const request = require('request')
const rp = require('request-promise')
const puppeteer = require('puppeteer-core')
const cheerio = require('cheerio')
const moment = require('moment')
const appdata = require('./appdata.json')

let locale
let browser, listPage

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

async function parseAll () {
    await listPage.waitForSelector('div.download-list')
    const html = await listPage.content()
    let list
    list = list.connect(await parsePage(html))
    console.log(list)
    const result = {
        "Category": `PSN-${locale}`,
        "Columns": JSON.stringify(['Title', 'Account', 'Platform', 'Release']),
        "List": list
    }
}

async function parsePage (html) {
    let list = []
    const $ = cheerio.load(html)
    // $().each doesn't work with await call?
    for ( let i = 0; i < $('.download-list-item').length; i++) {
        const element = $('.download-list-item').get(i)
        const type = $('.download-list-item__metadata', element).text()
        // Only interested in games
        if (type.includes(appdata[locale].Game)) {
            const title = $('.download-list-item__title', element).text().trim()
            const link = $('.download-list-item__title', element).attr('href')
            // In case of multiple platforms
            let platform = []
            $('a', '.download-list-item__playable-on-info', element).each( (index, element) => {
                platform.push($(element).text())
            })
            const releaseDate = await getReleaseDate(link)
            list.push({
                'Title': title,
                'Account': locale,
                'Platform': platform.join(', '),
                'Release': releaseDate
            })
        }
    }
    return list
}

async function getReleaseDate (link) {
    const html = await rp(`https://store.playstation.com${link}`)
    const $ = cheerio.load(html)
    // Second info item
    const releaseDate = $('.provider-info__list-item', '.provider-info__text').eq(1).text().trim()
    // Normalize date to ISO 8601 extended format
    const normalized = moment(releaseDate, appdata[locale].DateFormat).format('YYYY-MM-DD')
    return normalized
}

async function handler () {
    locale = process.argv[2].toUpperCase()
    if (!appdata[locale]) {
        console.log('Region undefined or unsupported region')
        return
    }
    await connectChrome()
    await parseAll()
    await listPage.close()
    process.exit()
}

handler()

