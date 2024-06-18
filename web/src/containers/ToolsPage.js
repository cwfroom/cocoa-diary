import React, {Component} from 'react'
import { Box, TextField, Button } from '@mui/material'
import TabBar from '../components/TabBar'
import { Auth } from '../services/auth'

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
        Auth.authedFetch('tools/'+route, body)
        .then(result => {
            if (result) callback(result)
        })
    }

    uploadClick = () => {
        this.toolsFetch('upload', {}, this.updateStatus)
    }

    downloadClick = () => {
        this.toolsFetch('download', {}, this.updateStatus)
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
                        onClick={this.uploadClick}
                    >
                        Upload
                    </Button>
                </Box>
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