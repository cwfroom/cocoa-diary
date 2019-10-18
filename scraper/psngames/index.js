'use strict'
const path = require('path')
const fs = require('fs')
const util = require('util')
const request = require('request')
const puppeteer = require('puppeteer-core')
const cheerio = require('cheerio')
const appdata = require('./appdata.json')

let page

async function connectChrome () {
    let resp
    try {
        resp = await util.promisify(request)(`http://localhost:9222/json/version`)
    }catch (err) {
        console.log('Make sure to start chrome in debug mode first')
        process.exit()
    }
    const { webSocketDebuggerUrl } = JSON.parse(resp.body)
    const browser = await puppeteer.connect({browserWSEndpoint: webSocketDebuggerUrl})
    page = await browser.newPage()
    await page.goto(appdata.ListURL, { waituntil:'domcontentloaded' })
}

async function parseAll () {
    await page.waitForSelector('div.download-list')
    const currentPage = page.content()
    let list = parsePage(html)
    const result = {
        "Category": `PSN-${appdata.StoreRegion}`,
        "Columnes": JSON.stringify(['Title', 'Platform']),
        "List": list
    }
}

function parsePage (html) {
    const $ = cheerio.load(html)
    

}

async function handler () {
    await connectChrome()
    await parseAll()
}

handler()

