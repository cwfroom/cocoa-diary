import React, {Component} from 'react'
import { Box, ButtonGroup, List, ListItem, Button, TextField } from '@mui/material'
import TextEditor from './TextEditor'
import update from 'immutability-helper'

class LogbookItemEditor extends Component {
    /*
        Required props
        columns
        activeEntry
        liftState
        handleDelete
    */

    constructor (props) {
        super(props)
        this.state = {
            entry: this.props.activeEntry,
            toggleProps : false,
            listHeight : 0
        }
    }

    componentDidMount () {
        this.updateListHeight()
    }

    updateListHeight () {
        let height = this.listItemElement.clientHeight
        if (this.state.toggleProps) {
            height = height * 3
        }else{
            height = height * (this.props.columns.length + 1)
        }
        this.setState({
            listHeight: height
        })
    }

    handleTooglePropsButtonClick = (event) => {
        this.setState({
            toggleProps: !this.state.toggleProps,
        }, this.updateListHeight)
    }

    handleEntryEdit = (column) => (event) => {
        this.setState({
            entry : update(this.state.entry, {[column]: {$set: event.target.value}})
        })
    }

    handleAddNotesButtonClick = (event) => {
        const alias = this.state.entry['Title'].replace(/[<>:"/\\|?*\s]/g, "").slice(0, 20)
        this.setState({
            entry: update(this.state.entry, { 
                'Alias': {$set: alias},
                'Notes': {$set: ''}
                }
            )
        })
    }

    render () {
        return (
            <Box>
                <List>
                    <ListItem>
                    <ButtonGroup>
                            <Button
                                variant = 'outlined'
                                color = 'primary'
                                onClick={this.props.liftState(null, true)}
                            >
                                Back
                            </Button>
                            <Button
                                variant='outlined'
                                color="primary"
                                onClick={this.props.liftState(this.state.entry, true)}
                            >
                                Save
                            </Button>
                            <Button
                                variant = 'outlined'
                                color = 'primary'
                                onClick={this.handleTooglePropsButtonClick}
                                disabled = {this.state.entry['Alias'] === undefined}
                            >
                                Toogle Props
                            </Button>
                            <Button
                                variant = 'outlined'
                                color = 'primary'
                                onClick={this.handleAddNotesButtonClick}
                                disabled = {this.state.entry['Alias'] !== undefined}
                            >
                                Add Notes
                            </Button>
                            <Button
                                variant = 'outlined'
                                color = 'error'
                                onClick={this.props.handleDelete}
                            >
                                Delete
                            </Button>
                        </ButtonGroup>
                    </ListItem>
                    {this.state.toggleProps ? 
                    <ListItem
                        key='listitem-Title'
                        ref = { (listItemElement) => {this.listItemElement = listItemElement}}
                    >
                        <TextField
                            label = 'Title'
                            value = {this.state.entry['Title']}
                            onChange = {this.handleEntryEdit('Title')}
                            fullWidth
                        />
                    </ListItem>
                    :
                    this.props.columns.map( (column) =>
                        <ListItem
                            key = {'listitem-'+column}
                            ref = { (listItemElement) => {this.listItemElement = listItemElement}}
                        >
                            <TextField
                                label = {column}
                                value = {this.state.entry[column]}
                                onChange = {this.handleEntryEdit(column)}
                                fullWidth
                            />
                        </ListItem>
                    )}
                    {this.state.entry['Alias'] && 
                        <ListItem key = {'listitem-Alias'}>
                            <TextField
                                label = 'Alias'
                                value = {this.state.entry['Alias']}
                                onChange = {this.handleEntryEdit('Alias')}
                                fullWidth
                            />
                        </ListItem>
                    }
                    {this.state.entry['Alias'] && 
                        <ListItem>
                            <TextEditor
                                text = {this.state.entry['Notes']}
                                onChange = {this.handleEntryEdit('Notes')}
                                referenceHeight = {this.state.listHeight}
                            />
                        </ListItem>
                    }
                    </List>
            </Box>
        )
    }

}

export default LogbookItemEditor