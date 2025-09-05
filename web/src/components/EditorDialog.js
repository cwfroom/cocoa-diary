import React, {Component} from 'react'
import { Dialog, DialogContent, DialogActions, Button, TextField } from '@mui/material'


class EditorDialog extends Component {
    constructor (props) {
        super(props)
        this.state = {
            value : props.value
        }
    }

    handleValueEdit = (event) => {
        this.setState({
            value: event.target.value
        })
    }

    handleClose = (confirmChange) => (event) => {
        if (confirmChange) {
            this.props.handleClose(this.state.value)
        } else {
            this.props.handleClose(null)
        }
    }

    render () {
        return (
        <Dialog open={this.props.open}>
            <DialogContent>
                <TextField 
                    value = {this.state.value}
                    onChange = {this.handleValueEdit}
                />
            </DialogContent>
            <DialogActions>
                <Button color='error' disabled={this.props.mode !== 'rename'} onClick={this.props.handleDelete}>Delete</Button>
                <Button onClick={this.handleClose(false)}>Cancel</Button>
                <Button variant='contained' onClick={this.handleClose(true)}>OK</Button>
            </DialogActions>
        </Dialog>
        )
    }
}

export default EditorDialog