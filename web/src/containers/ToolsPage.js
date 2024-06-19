import React, {Component} from 'react'
import { Box, Button } from '@mui/material'
import TabBar from '../components/TabBar'
import { Auth } from '../services/auth'
import moment from 'moment'

const styles = {
    paddedButton: {
        padding: '10px',
        float: 'left'
    }
}

class Tools extends Component {

    constructor (props) {
        super(props)
        this.state = {
            statusMessage: ''
        }
    }

    toolsFetch = (route, body, callback) => {
        Auth.authedFetch('tools/'+route, body, true)
        .then(result => {
            if (result) callback(result)
        })
    }

    downloadClick = () => {
        this.toolsFetch('download', {}, this.handleDownload)
    }

    handleDownload = (result) => {
        const href = window.URL.createObjectURL(result)
        const link = document.createElement('a')
        link.href = href
        const date = new Date()
        const formattedDate = moment(date).format('YYMMDD')
        link.setAttribute('download', `Backup${formattedDate}.zip`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    updateStatus = (text) => {
        this.setState = {
            statusMessage: text
        }
    }

    render () {
        return (
            <div>
                <TabBar/>
                <br />
                <Box sx={styles.paddedButton}>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={this.downloadClick}
                    >
                        Download
                    </Button>
                </Box>
                {this.statusMessage}
            </div>
        )
    }
}

export default Tools