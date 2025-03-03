import React, {Component} from 'react'
import { Box, ButtonGroup, List, ListItem, Button, TextField } from '@mui/material'
import TextEditor from './TextEditor'
import AutoSaveButton from './AutoSaveButton'
import { Auth } from '../services/auth'
import update from 'immutability-helper'

class LogbookItemEditor extends Component {
    /*
        Required props
        category
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
            listHeight : 0,
            havePendingChanges : false
        }
    }

    componentDidMount = () => {
        this.updateListHeight()
        this.fetchNotes()
    }

    logbookFetch = (route, body, callback) => {
        Auth.authedFetch(`logbook/${route}`, body)
        .then(result => callback(result))
    }

    updateListHeight () {
        let height = this.listItemElement.clientHeight
        if (this.state.toggleProps) {
            height = height * 3
        }else{
            height = height * (this.props.columns.length + 2)
        }
        this.setState({
            listHeight: height
        })
    }

    fetchNotes () {
        if (this.state.entry['Alias']) {
            const body = {
                'category' : this.props.category,
                'alias' : this.state.entry['Alias']
            }
            this.logbookFetch('notes', body, (result) => {
                if (result['Notes'] !== undefined) {
                    this.setState({
                        entry: update(this.state.entry, { 
                            'Notes': {$set: result['Notes']}
                        })
                    })
                }else{
                    this.setState({
                        entry: update(this.state.entry, { 
                            'Notes': {$set: ''}
                        })
                    })
                }
            })
        }
    }

    handleTooglePropsButtonClick = (event) => {
        this.setState({
            toggleProps: !this.state.toggleProps,
        }, this.updateListHeight)
    }

    handleEntryEdit = (column) => (event) => {
        this.setState({
            entry : update(this.state.entry, {[column]: {$set: event.target.value}}),
            havePendingChanges: true
        })
    }

    handleAddNotesButtonClick = (event) => {
        const alias = this.state.entry['Title'].replace(/[<>:"/\\|?*\s]/g, "").slice(0, 20)
        this.setState({
            entry: update(this.state.entry, {'Alias': {$set: alias}})
        }, this.fetchNotes)
    }

    liftState = (applyEdits = false, quitEditMode = false) => {
        let entry = null
        if (applyEdits) {
            entry = this.state.entry
            this.setState({
                havePendingChanges : false
            })
        }
        this.props.liftState(entry, quitEditMode)
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
                                onClick={() => (this.liftState(false, true))}
                            >
                                Back
                            </Button>
                            <Button
                                variant='outlined'
                                color="primary"
                                onClick={() => (this.liftState(true, true))}
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
                                disabled = {this.state.entry['Alias'] === undefined}
                                onClick={() => {this.props.handleDelete(true)}}
                            >
                                Delete Notes
                            </Button>
                            <Button
                                variant = 'outlined'
                                color = 'error'
                                onClick={() => {this.props.handleDelete(false)}}
                            >
                                Delete Entry
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
                                value = {this.state.entry[column] ? this.state.entry[column] : ''}
                                onChange = {this.handleEntryEdit(column)}
                                fullWidth
                            />
                        </ListItem>
                    )}
                    {!this.state.toggleProps && this.state.entry['Alias'] && 
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
                    <Box
                        sx = {{'marginRight': '10px'}}
                    >
                        <AutoSaveButton
                                onSave = {() => {this.liftState(true, false)}}
                                buttonDisabled = {!this.state.havePendingChanges}
                        />
                    </Box>
            </Box>
        )
    }

}

export default LogbookItemEditor