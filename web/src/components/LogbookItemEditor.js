import React, {Component} from 'react'
import { Box, ButtonGroup, List, ListItem, Button, TextField } from '@mui/material'
import TextEditor from './TextEditor'

class LogbookItemEditor extends Component {
    /*
        Required props
        columns
        activeEntry
        handleEntryEdit
        handleSaveButtonClick
        handleAddNotesButtonClick
        handleDeleteButtonClick
    */

    constructor (props) {
        super(props)
        this.state = {
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

    render () {
        return (
            <Box>
                <List>
                    <ListItem>
                    <ButtonGroup>
                            <Button
                                variant = 'outlined'
                                color = 'primary'
                                onClick={this.props.handleSaveButtonClick(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant = 'outlined'
                                color = 'primary'
                                onClick={this.handleTooglePropsButtonClick}
                                disabled = {this.props.activeEntry['Alias'] === undefined}
                            >
                                Toogle Props
                            </Button>
                            <Button
                                variant = 'outlined'
                                color = 'primary'
                                onClick={this.props.handleAddNotesButtonClick}
                                disabled = {this.props.activeEntry['Alias'] !== undefined}
                            >
                                Add Notes
                            </Button>
                            <Button
                                variant = 'outlined'
                                color = 'error'
                                onClick={this.props.handleDeleteButtonClick}
                            >
                                Delete
                            </Button>
                            <Button
                                variant='outlined'
                                color="primary"
                                onClick={this.props.handleSaveButtonClick(true)}
                            >
                                Save
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
                            value = {this.props.activeEntry['Title']}
                            onChange = {this.props.handleEntryEdit('Title')}
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
                                value = {this.props.activeEntry[column]}
                                onChange = {this.props.handleEntryEdit(column)}
                                fullWidth
                            />
                        </ListItem>
                    )}
                    {this.props.activeEntry['Alias'] && 
                        <ListItem key = {'listitem-Alias'}>
                            <TextField
                                label = 'Alias'
                                value = {this.props.activeEntry['Alias']}
                                onChange = {this.props.handleEntryEdit('Alias')}
                                fullWidth
                            />
                        </ListItem>
                    }
                    {this.props.activeEntry['Alias'] && 
                        <ListItem>
                            <TextEditor
                                text = {this.props.activeEntry['Notes']}
                                onChange = {this.props.handleEntryEdit('Notes')}
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