import React, {Component} from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Box, List, ListItem } from '@material-ui/core'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core'
import EditDialog from '../components/EditDialog'
import TabBar from '../components/TabBar'
import { Auth } from '../services/auth'
import moment from 'moment'

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
        maxHeight: 'calc(100vh - 100px)',
        paddingRight: '10px',
        overflow: 'auto'
    },
    categoryList: {
        marginTop: '5px',
        height: '80vh',
        overflow: 'auto'
    },
    statusLabel: {
        float: 'right'
    }
}


class Logbook extends Component {
    constructor (props) {
        super(props)

        this.state = {
            categories: [],
            selectedIndex: 0,
            columns: [],
            list: [],
            openDialog: false,
            selectedRow: null,
            pendingChanges: {},
            statusMessage: ''
        }
    }

    componentDidMount = () => {
        document.addEventListener('keydown', this.hotKeys, false)
        this.logbookFetch('index', {}, (result) => {
            this.setState({
                categories: result
            })
        })
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.categories.length !== this.state.categories.length || prevState.selectedIndex !== this.state.selectedIndex) {
            const body = {
                category: this.state.categories[this.state.selectedIndex],
                selectedRow: null
            }
            this.logbookFetch('category', body, (result) => {
                this.setState({
                    columns: result['Columns'],
                    list: result['List'].reverse()
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
            {selectedIndex: value}
        )
    }

    handleTableCellClick = (value) => {
        if (Auth.isLoggedIn()) {
            if (value === this.state.selectedRow) {
                this.setState({
                    selectedRow: value,
                    openDialog: true
                })
            }else {
                this.setState({
                    selectedRow: value
                })
            }
        }
    }

    getRealIndex = () => {
        if (this.state.selectedRow === null) {
            return null
        }else {
            return this.state.list.length - this.state.selectedRow - 1
        }
    }

    handleRowUpdate = (key, value) => {
        this.setState( (state) => {
            let listCopy = [...state.list]
            let pendingChangesCopy = state.pendingChanges
            const realIndex = state.list.length - state.selectedRow - 1
            if (!pendingChangesCopy['Index']) {
                pendingChangesCopy['Index'] = realIndex
            }
            listCopy[state.selectedRow][key] = value
            pendingChangesCopy[key] = value
            return {
                ...state,
                list: listCopy,
                pendingChanges: pendingChangesCopy
            }
        })
    }

    submitChanges = () => {
        if (Object.entries(this.state.pendingChanges).length !== 0){
            const body = {
                'category': this.state.categories[this.state.selectedIndex],
                'changes': this.state.pendingChanges
            }
            this.logbookFetch('submit', body, (result) => {
                this.setState({
                    statusMessage: `${result['Result']} ${moment.unix(result['Timestamp']).format('YYYY/MM/DD HH:mm:ss Z')}`
                })
                if (result['Result'] !== 'Error') {
                    this.setState(
                        {pendingChanges: {}}
                    )
                }
            })
        }
    }

    submitEdit = (action, index) => {
        const body = {
            'category': this.state.categories[this.state.selectedIndex],
            'index': index
        }
        this.logbookFetch(action, body, (result) => {
            this.setState({
                statusMessage: `${result['Result']} ${moment.unix(result['Timestamp']).format('YYYY/MM/DD HH:mm:ss Z')}`
            })
        })
    }

    handleDelete = () => {
        let realIndex = this.getRealIndex()
        if (realIndex !== null) {
            this.submitEdit('delete', realIndex)
            this.setState( (state) => {
            let listCopy = [...state.list]
            listCopy.splice(this.state.selectedRow, 1)
            return {
                ...state,
                openDialog: false,
                list: listCopy
            }
        })
        }
    }

    handleInsert = () => {
        this.submitEdit('insert', this.getRealIndex())
        this.setState( (state) => {
            let listCopy = [...state.list]
            listCopy.splice(this.state.selectedRow + 1, 0, {})
            return {
                ...state,
                openDialog: false,
                list: listCopy
            }
        })
    }

    createEntry = () => {
        this.setState( (state) => {
            const modified = [{}, ...state.list]
            return {
                ...state,
                list: modified,
                selectedRow: 0,
                openDialog: true
            }
        })
    }

    swapEntry = (direction) => {
        const realIndex = this.getRealIndex()
        if (realIndex !== null) {
            if (direction === 'up') {
                if (realIndex < this.state.list.length) {
                    this.submitEdit('swap', [realIndex, realIndex + 1])
                    this.localSwap(this.state.selectedRow, this.state.selectedRow - 1)
                }
            }else if (direction === 'down'){
                if (realIndex > 0) {
                    this.submitEdit('swap', [realIndex, realIndex - 1])
                    this.localSwap(this.state.selectedRow, this.state.selectedRow + 1)
                }
            }
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
                selectedRow: other
            }
        })
    }

    hotKeys = (event) => {
        if (Auth.isLoggedIn()) {
            if (event.ctrlKey && event.altKey) {
                if (event.key === 'n' || event.key === 'N') {
                    this.createEntry()
                }else if (event.key === 's' || event.key === 'S') {
                    this.submitChanges()
                }else if (event.key === 'r' || event.key === 'R') {
                    this.forceReload()
                }else if (event.key === 'ArrowUp') {
                    this.swapEntry('up')
                }else if (event.key === 'ArrowDown') {
                    this.swapEntry('down')
                }
            }else {
                if (event.key === 'Delete') {
                    this.handleDelete()
                }
            }
        }
    }

    forceReload = () => {
        const body = {
            category: this.state.categories[this.state.selectedIndex]
        }
        this.logbookFetch('reload', body, (result) => {
            this.setState({
                columns: result['Columns'],
                list: result['List'].reverse()
            })
        })
    }

    closeDialog = () => {
        this.setState({
            openDialog: false
        })
        this.submitChanges()
    }

    render () {
        const {classes} = this.props
        return (
            <div>
                <TabBar/>
                <br />
                <Box className={classes.leftPanel}>
                    <List className={classes.categoryList}>
                    {this.state.categories.map( (category, i) => 
                        <ListItem
                            button
                            selected = {this.state.selectedIndex === i}
                            key={i}
                            onClick={this.handleCategoryListClick.bind(this, i)}
                        >
                            {category}
                        </ListItem>
                    )}
                    </List>
                </Box>

                <Box className={classes.rightPanel}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                {this.state.columns.map( (column, i) => 
                                    <TableCell key={'title-'+column}>{column}</TableCell>
                                )
                                }
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {Auth.isLoggedIn() && 
                            <TableRow>
                                <TableCell onClick={this.createEntry}>New...</TableCell>
                            </TableRow>
                            }
                            {this.state.list.map( (entry, i) => 
                                <TableRow
                                    key={'row-'+i}
                                    selected={this.state.selectedRow === i}
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
                        <br />
                </Box>

                <Box className={classes.statusLabel}>
                    {Auth.isLoggedIn() && this.state.statusMessage}
                </Box>

                {Auth.isLoggedIn() &&
                <EditDialog
                    openDialog={this.state.openDialog}
                    closeDialog={this.closeDialog}
                    columns={this.state.columns}
                    row={this.state.list[this.state.selectedRow]}
                    handleRowUpdate={this.handleRowUpdate}
                    handleDelete={this.handleDelete}
                    handleInsert={this.handleInsert}
                    enableComments={true}
                />
                }

            </div>
        )
    }
}

export default withStyles(styles)(Logbook)