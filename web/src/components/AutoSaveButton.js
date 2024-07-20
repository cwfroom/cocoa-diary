import React, {Component} from 'react'
import { Box, Button } from '@mui/material'
import { setTimeout, clearTimeout } from 'timers-browserify'

const styles = {
    saveButton : {
        float: 'right'
    }
}

class AutoSaveButton extends Component {
    /*
        Required props
        onSave
        buttonDisabled
    */

    componentDidMount = () => {
        document.addEventListener('keydown', this.hotKey, false)
    }

    componentWillUnmount = () => {
        document.removeEventListener('keydown', this.hotKey)
    }

    componentDidUpdate(prevProps, prevState) {
        // Start timer when there are pending edits
        if (prevProps.buttonDisabled && !this.props.buttonDisabled) {
            this.autoSaveTimer = this.autoSave()
        }
    }

    autoSave = () => {
        return setTimeout(this.onSave, 10000)
    }

    onSave = (event) => {
        clearTimeout(this.autoSaveTimer)
        this.props.onSave()
    }

    hotKey = (event) => {
        if (event.ctrlKey && event.shiftKey) {
            if (event.key === 's' || event.key === 'S') {
                this.onSave()
            }
        }
    }

    render () {
        return (
            <Box sx={styles.saveButton}>
            <Button
                variant='contained'
                color="primary"
                onClick={this.onSave}
                disabled={this.props.buttonDisabled}
            >
                Save
        </Button>
        </Box>
        )
    }
}

export default AutoSaveButton