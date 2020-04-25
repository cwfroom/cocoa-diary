import React, {Component} from 'react'
import {Button, TextField} from '@material-ui/core'
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core'

class EditDialog extends Component {
    constructor (props) {
        super (props)
        this.state = {
            changes: {}
        }
    }

    handleClose = () => {
        this.props.closeDialog()
    }
    
    handleConfirm = () => {
        this.props.udpateRow(this.state.changes)
    }

    handleTextFieldUpdate = (key) => (event) => {
        this.props.handleRowUpdate(key, event.target.value)
    }

    handlePressCtrlEnter = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            this.handleClose()
        }
    }

    render () {
        return (
            <div>
            <Dialog open={this.props.openDialog} onClose={this.handleClose}>
                <DialogTitle id="form-dialog-title">Edit Entry</DialogTitle>
                <DialogContent>
                    {this.props.columns.map( (column, i) => 
                        <TextField
                            fullWidth
                            key={'textfield-'+column}
                            label={column}
                            value={(this.props.row && this.props.row[column]) ? this.props.row[column] : ''}
                            onChange={this.handleTextFieldUpdate(column)}
                            onKeyDown={this.handlePressCtrlEnter}
                        />
                    )}
                    {this.props.enableComments &&
                            <TextField
                            fullWidth
                            multiline
                            key='textfield-comments'
                            label='Comments'
                            value={(this.props.row && this.props.row['Comments']) ? this.props.row['Comments'] : ''}
                            onChange={this.handleTextFieldUpdate('Comments')}
                            onKeyDown={this.handlePressCtrlEnter}
                        />
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.handleDelete} color="secondary">
                        Delete
                    </Button>
                    <Button onClick={this.props.handleInsert} color="primary">
                        Insert
                    </Button>
                    <Button onClick={this.handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
          </div>
        )
    }

}

export default EditDialog