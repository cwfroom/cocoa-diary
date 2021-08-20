'use strict'
const config = require('./config.json')
const AWS = require('aws-sdk')

let db = ( function () {
    let instance = null

    function db () {
        let docClient = null
        if (config['AccessKey'] !== '' && config['SecretKey'] !== '') {
            AWS.config.update({
                region: 'ap-northeast-1',
                accessKeyId: config['AccessKey'],
                secretAccessKey: config['SecretKey']
            })
            docClient = new AWS.DynamoDB.DocumentClient()
        }else {
            console.log('AWS AccessKey and SecretKey not set')
        }

        return {
            putItem : function (item) {
                const params = {
                    TableName: 'cocoa-diary',
                    Item: item
                }
                docClient.put(params, (err, data) => {
                    if (err) console.log(err)
                })
            },
            updateMonth : function (year, month, list) {
                let item = {
                    'Type': 'Diary',
                    'ID': year.toString() + ('0' + month).slice(-2),
                    'List': list
                }
                this.putItem(item)
            },
            updateLogbook: function (category, columns, list) {
                let item = {
                    'Type': 'Logbook',
                    'ID': category,
                    'Columns': columns,
                    'List': list
                }
                this.putItem(item)
            }
        }
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = new db()
                delete instance.constructor
            }
            return instance;
        }
    }
})()

module.exports = {
    db
}