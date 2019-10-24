'use strict'
const fs = require('fs')
const path = require('path')
const util = require('util')
const moment = require('moment')

let list = []

function loadAll () {
    fs.readdirSync( path.join(__dirname, '/raw')).forEach( (file) => {
        if (file.includes('json')) {
            const rawFile = JSON.parse(fs.readFileSync(path.join(__dirname, '/raw/', file)))
            list = list.concat(rawFile.List)
        }
    })
}

function filterThemes () {
    // Some themes are labeled as "Game" in PSN store for some reason
    list = list.filter( (item) => {
        return  (!item.Title.includes('テーマ') && !item.Title.includes('Theme'))
    })
}

function filterPSP () {
    // Ignore PSP games
    list = list.filter( (item) => {
        return (!item.Platform.includes('PSP'))
    })
}

function combilePlatforms () {
    // Vita games are also labeled as playable on PS3
    list = list.map( (item) => {
        if (item.Platform.includes('PS3') && item.Platform.includes('PS Vita')) {
            item.Platform = 'PS Vita'
        }
        return item
    })
}

function addAttr () {
    list = list.map( (item) => {
        item['Media'] = 'Digital'
        item['Status'] = ''
        return item
    })
}

function convertDate (date) {
    if (!date || date === '' || date === 'Invalid date') {
        return 0
    }else{
        return moment(date)
    }
}

function sortByDate () {
    list.sort( (a, b) => {
        return convertDate(a.Release) > convertDate(b.Release)
    })
}

async function handler () {
    loadAll()
    filterThemes()
    filterPSP()
    combilePlatforms()
    
    addAttr()
    sortByDate()
    const result = {
        Catetory: 'PSN',
        Columns: ['Title', 'Regions', 'Platform', 'Release', 'Media', 'Status'],
        List: list
    }
    fs.writeFileSync(path.join(__dirname, 'PSN.zzd'), JSON.stringify(result))
}

handler()
