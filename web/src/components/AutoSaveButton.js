import React, {Component} from 'react'
import { Box, Button } from '@mui/material'
import { setTimeout, clearTimeout } from 'timers-browserify'

const styles = {
    saveButton : {
        float: 'right'
    }
}

class AutoSaveButton extends Component {
    componentDidMount = () => {
        this.autoSaveTimer = this.autoSave()
    }

    autoSave = () => {
        return setTimeout(this.onSave, 10000)
    }

    onSave = (event) => {
        clearTimeout(this.autoSaveTimer)
        this.autoSaveTimer = this.autoSave()
        this.props.onSave()
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