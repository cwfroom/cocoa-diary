'use strict'
const path = require('path')
const fs = require('fs')
const rp = require('request-promise')
const puppeteer = require('puppeteer-core')
const cheerio = require('cheerio')
const appdata = require('./appdata.json')

let locale, isUpdate
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

async function parseList () {
    let list = []
    await listPage.waitForSelector('div.download-list')
    let html = await listPage.content()
    while (hasNext(html)) {
        const nextPageNav = await listPage.$('.download-top-controls .paginator-control__next')
        list = list.concat(await parsePage(html))
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

async function parsePage (html) {
    let list = []
    const $ = cheerio.load(html)
    // $().each doesn't work with await call?
    for ( let i = 0; i < $('.download-list-item').length; i++) {
        const element = $('.download-list-item').get(i)
        const type = $('.download-list-item__metadata', element).text()
        const title = $('.download-list-item__title', element).text().trim()
        // Only interested in games. It's impossible to filter every title, manual edit is still required.
        if (type.includes(appdata[locale].Game) && !includesIgnore(title, locale)) {
            // In case of multiple platforms
            let platform = []
            $('a', '.download-list-item__playable-on-info', element).each( (index, element) => {
                platform.push($(element).text())
            })
            console.log(`${title} ${platform.join(', ')}`)
            list.push({
                'Title': title,
                'Platform': platform.join(', '),
                'Status': ''
            })
        }
    }
    return list
}

async function handler () {
    locale = process.argv[2].toUpperCase()
    if (!appdata[locale]) {
        console.log('Region undefined or unsupported region')
        return
    }
    await connectChrome()
    await parseList()
    await listPage.close()
    process.exit()
}

handler()

