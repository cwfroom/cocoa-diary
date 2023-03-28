import fs from 'fs'

//ES6 doesn't support JSON import yet.
class config {
    constructor () {
        const configPath = new URL('config.json', import.meta.url)
        this.configData = JSON.parse(fs.readFileSync(configPath, {encoding: 'utf8'}))
    }

    get data() {
        return this.configData
    }
}

const configInstance = new config()
Object.freeze(config)
export default configInstance