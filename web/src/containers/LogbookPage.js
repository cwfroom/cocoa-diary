import React, {Component} from 'react'
import { Box, List, ListItemButton } from '@mui/material'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'
import TabBar from '../components/TabBar'
import LogbookItemEditor from '../components/LogbookItemEditor'
import { Auth } from '../services/auth'
import moment from 'moment'
import update from 'immutability-helper'

const styles = {
    leftPanel: {
        maxWidth: '90px',
        float: 'left',
        marginRight: '10px',
        padding: '0'
    },
    rightPanel: {
        marginLeft: '100px',
        maxWidth: 'calc(100% - 100px)',
        paddingRight: '10px',
    },
    tableContainer: {
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'scroll'
    },
    categoryList: {
        marginTop: '5px',
        height: '80vh',
        overflow: 'auto'
    },
    statusLabel: {
        marginLeft: '10px',
        float: 'left'
    }
}

class LogbookPage extends Component {
    constructor (props) {
        super(props)

        this.state = {
            categories: [],
            categoryIndex: null,
            columns: [],
            data: {},
            list: [],
            editMode: false,
            segments: ['Default'],
            segmentIndex: 0,
            entryIndex: null,
            activeEntry: null,
            statusMessage: ''
        }
    }

    componentDidMount = () => {
        document.addEventListener('keydown', this.hotKeys, false)
        this.logbookFetch('index', {}, (result) => {
            const prevIndex = sessionStorage.getItem('categoryIndex')
            if (prevIndex === null) {
                this.setState({
                    categories: result
                })
            }else {
                this.setState({
                    categories: result,
                    categoryIndex: prevIndex
                })
            }
        })
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.state.categoryIndex !== null && 
            (prevState.categories.length !== this.state.categories.length || prevState.categoryIndex !== this.state.categoryIndex)
        ) {
            const body = {
                category: this.state.categories[this.state.categoryIndex]
            }
            this.logbookFetch('category', body, (result) => {
                this.setState({
                    columns: result['Columns'],
                    data: result['List'],
                    list: result['List'][this.state.segments[this.state.segmentIndex]]
                })
            })
        }
    }

    componentWillUnmount = () => {
        document.removeEventListener('keydown', this.hotKeys)
    }

    logbookFetch = (route, body, callback) => {
        Auth.authedFetch(`logbook/${route}`, body)
        .then(result => callback(result))
    }

    handleCategoryListClick = (value) => {
        this.setState(
            {
                categoryIndex: value,
                editMode: false
            }
        )
        sessionStorage.setItem('categoryIndex', value)
    }

    handleTableCellClick = (value) => {
        let selectedEntry = this.state.list[this.state.entryIndex]
        if (value === this.state.entryIndex) {
            this.setState({
                activeEntry: selectedEntry,
                editMode: true,
                statusMessage: `Editing Segment ${this.state.segmentIndex} Index ${this.state.entryIndex}`
            })
        }else {
            this.setState({
                entryIndex: value,
            }, () => {
                this.setState({
                    statusMessage: `Selected Segment ${this.state.segmentIndex} Index ${this.state.entryIndex}`
                })
            })
        }
    }

    locatorHelper (index = this.state.entryIndex) {
        return {
            'segment': this.state.segments[this.state.segmentIndex],
            'index': index
        }
    }

    submitListEdit = (action, locator) => {
        const body = {
            'category': this.state.categories[this.state.categoryIndex],
            'locator': locator
        }
        this.logbookFetch(action, body, (result) => {
            this.setState({
                statusMessage: `${result['Result']} ${moment.unix(result['Timestamp']).format('YYYY/MM/DD HH:mm:ss Z')}`
            })
        })
    }

    applyLocalListEdits = () => {
        this.setState({
            data: update(this.state.data, {[this.state.segments[this.state.segmentIndex]]: {$set: this.state.list}})
        })
    }

    handleDelete = (deleteNotes = false) => {
        if (this.state.entryIndex !== null) {
            if (deleteNotes) {
                this.submitListEdit('deleteEntryAndNotes', this.locatorHelper())
            } else {
                this.submitListEdit('deleteEntryOnly', this.locatorHelper())
            }
            this.setState({
                editMode: false,
                list: update(this.state.list, {$splice: [[this.state.entryIndex, 1]]})
            }, this.applyLocalListEdits)
        }
    }

    handleInsert = () => {
        this.submitListEdit('insert', this.locatorHelper())
        this.setState({
            editMode: false,
            list: update(this.state.list, {$splice: [[this.state.entryIndex + 1, 0]]})
        }, this.applyLocalListEdits)
    }

    createEntry = () => {
        let newEntry = {}
        for (let i = 0; i < this.state.columns.length; i++) {
            newEntry[this.state.columns[i]] = ''
        }
        this.setState({
            entryIndex: 0,
            list: update(this.state.list, {$unshift: [newEntry]}),
            activeEntry: newEntry,
            editMode: true
        }, () => {
            this.applyLocalListEdits()
            this.submitListEdit('insert', this.locatorHelper())
        })
    }

    swapEntry = (direction) => {
        if (this.state.entryIndex !== null) {
            if (direction === 'up') {
                if (this.state.entryIndex !== 0 && this.state.entryIndex < this.state.list.length) {
                    this.submitListEdit('swap', this.locatorHelper([this.state.entryIndex, this.state.entryIndex - 1]))
                    this.localSwap(this.state.entryIndex, this.state.entryIndex - 1)
                }
            }else if (direction === 'down'){
                if (this.state.entryIndex !== this.state.list.length - 1 && this.state.entryIndex >= 0) {
                    this.submitListEdit('swap', this.locatorHelper([this.state.entryIndex, this.state.entryIndex + 1]))
                    this.localSwap(this.state.entryIndex, this.state.entryIndex + 1)
                }
            }
        }
    }

    pinEntry = () => {
        if (this.state.entryIndex !== null && this.state.entryIndex !== 0 && this.state.entryIndex < this.state.list.length) {
            this.submitListEdit('pin', this.locatorHelper(this.state.entryIndex))
            this.localPin(this.state.entryIndex)
        }
    }

    localSwap = (index, other) => {
        this.setState( (state) => {
            let listCopy = [...state.list]
            let temp = listCopy[index]
            listCopy[index] = listCopy[other]
            listCopy[other] = temp
            return {
                ...state,
                list: listCopy,
                entryIndex: other
            }
        }, this.applyLocalListEdits)
    }

    localPin = (index) => {
        this.setState( (state) => {
            let listCopy = [...state.list]
            let temp = listCopy.splice(index, 1)[0]
            listCopy.unshift(temp)
            return {
                ...state,
                list: listCopy,
                entryIndex: 0
            }
        }, this.applyLocalListEdits)
    }

    hotKeys = (event) => {
        if (!this.state.editMode) {
            if (event.ctrlKey && event.altKey) {
                if (event.key === 'n' || event.key === 'N') {
                    this.createEntry()
                }else if (event.key === 'r' || event.key === 'R') {
                    this.forceReload()
                }else if (event.key === 'ArrowUp') {
                    this.swapEntry('up')
                }else if (event.key === 'ArrowDown') {
                    this.swapEntry('down')
                }else if (event.key === 'ArrowLeft') {
                    this.pinEntry()
                }else if (event.key === 'd' || event.key === 'D') {
                    this.handleDelete()
                }
            }
        }
    }

    forceReload = () => {
        const body = {
            category: this.state.categories[this.state.categoryIndex]
        }
        this.logbookFetch('reload', body, (result) => {
            this.setState({
                columns: result['Columns'],
                list: result['List'][this.state.segments[this.state.segmentIndex]]
            })
        })
    }

    handleEntryEdit = (column) => (event) => {
        this.setState({
            activeEntry : update(this.state.activeEntry, {[column]: {$set: event.target.value}})
        })
    }

    submitEntryEdit () {
        const body = {
            'category': this.state.categories[this.state.categoryIndex],
            'changes': update(this.state.activeEntry, {'locator': {$set: this.locatorHelper()}})
        }
        this.logbookFetch('submit', body, (result) => {
            this.setState({
                statusMessage: `${result['Result']} ${moment.unix(result['Timestamp']).format('YYYY/MM/DD HH:mm:ss Z')}`
            })
            if (result['Result'] !== 'Error') {
                this.setState(
                    {activeEntry: null}
                )
            }
        })
        this.setState({
            list: update(this.state.list, {[this.state.entryIndex]: {$set: this.state.activeEntry}})
        }, this.applyLocalListEdits)
    }



    handleApplyEdits = (entry, quitEditMode = false) => {
        if (quitEditMode) {
            this.setState({
                editMode: false
            })
        }
        if (entry !== null) {
            this.setState({
                activeEntry: entry
            }, this.submitEntryEdit)
        }
    }

    render () {
        return (
            <div>
                <TabBar/>
                <br />
                <Box sx={styles.leftPanel}>
                    <List sx={styles.categoryList}>
                    {this.state.categories.map( (category, i) => 
                        <ListItemButton
                            selected = {this.state.categoryIndex === i}
                            key={i}
                            onClick={this.handleCategoryListClick.bind(this, i)}
                        >
                            {category}
                        </ListItemButton>
                    )}
                    </List>
                </Box>

                <Box sx={styles.rightPanel}>
                    {!this.state.editMode ? 
                        <Box sx={styles.tableContainer}>
                            <Table
                                size='small'
                                stickyHeader
                            >
                                <TableHead>
                                    <TableRow>
                                    {this.state.columns.map( (column, i) => 
                                        <TableCell key={'title-'+column}>{column}</TableCell>
                                    )
                                    }
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                <TableRow>
                                    <TableCell onClick={this.createEntry}>New...</TableCell>
                                </TableRow>
                                {this.state.list.map( (entry, i) => 
                                    <TableRow
                                        key={'row-'+i}
                                        selected={this.state.entryIndex === i}
                                    >
                                        {this.state.columns.map( (column) => 
                                            <TableCell
                                                key={i+column}
                                                onClick={this.handleTableCellClick.bind(this, i)}>
                                            {(entry && entry[column]) ? entry[column] : ''}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                )}
                                </TableBody>
                            </Table>
                        </Box>
                        :
                        <LogbookItemEditor
                            category = {this.state.categories[this.state.categoryIndex]}
                            columns = {this.state.columns}
                            activeEntry = {this.state.activeEntry}
                            liftState = {this.handleApplyEdits}
                            handleDelete = {this.handleDelete}
                        />}
                        <Box sx={styles.statusLabel}>
                            {this.state.statusMessage}
                        </Box>
                </Box>
            </div>
        )
    }
}

export default LogbookPage