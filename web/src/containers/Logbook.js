import React, {Component} from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Box, List, ListItem, Snackbar } from '@material-ui/core'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core'
import EditDialog from '../components/EditDialog'

const styles = {
    leftPanel: {
        maxWidth: '250px',
        float: 'left',
        marginRight: '10px',
        padding: '0'
    },
    rightPanel: {
        marginLeft: '260px',
        maxWidth: 'calc(100% - 260px)',
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
            showSnackBar: false,
            selectedRow: 0,
            pendingChanges: {}
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
        if (prevState.categories.length !== this.state.categories.length) {
            const body = {
                category: this.state.categories[this.state.selectedIndex]
            }
            this.logbookFetch('category', body, (result) => {
                this.setState({
                    columns: result['Columns'],
                    list: result['List']
                })
            })
        }
    }

    componentWillUnmount = () => {
        document.removeEventListener('keydown', this.hotKeys)
    }

    logbookFetch = (route, body, callback) => {
        const headers = {
            'Content-Type': 'application/json'
        }
        fetch(`${this.props.apiURL}/logbook/${route}` , {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })
        .then( (res) => res.json())
        .then( (result) => {
            callback(result)
        })
    }

    handleCategoryListClick = (value) => {
        this.setState(
            {selectedIndex: value}
        )
    }

    handleTableCellClick = (value) => {
        this.setState({
            selectedRow: value,
            openDialog: true
        })
    }

    handleRowUpdate = (key, value) => {
        this.setState( (state) => {
            let listCopy = [...state.list]
            let pendingChangesCopy = state.pendingChanges
            if (!pendingChangesCopy[state.selectedRow]) {
                pendingChangesCopy[state.selectedRow] = {}
            }
            listCopy[state.selectedRow][key] = value
            pendingChangesCopy[state.selectedRow][key] = value
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
                    snackBarMessage: result['Result'],
                    showSnackBar: true
                })
            })
            this.setState(
                {pendingChanges: {}}
            )
        }
    }

    createEntry = () => {
        this.setState( (state) => {
            const modified = state.list.concat({})
            return {
                ...state,
                list: modified,
                selectedRow: modified.length - 1,
                openDialog: true
            }
        })
    }

    hotKeys = (event) => {
        if (event.ctrlKey && event.altKey) {
            if (event.key === 'n') {
                this.createEntry()
            }else if (event.key === 's') {
                this.submitChanges()
            }
        }
    }

    closeDialog = () => {
        this.setState({
            openDialog: false
        })
    }

    render () {
        const {classes} = this.props
        return (
            <div>
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
                            {this.state.list.map( (entry, i) => 
                                <TableRow key={'row-'+i}>
                                    {this.state.columns.map( (column) => 
                                        <TableCell
                                            key={i+column}
                                            onClick={this.handleTableCellClick.bind(this, i)}>
                                        {entry[column]}
                                        </TableCell>
                                    )}
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                        <br />
                        <Box className={classes.statusLabel}>
                            Queued: {Object.entries(this.state.pendingChanges).length}
                        </Box>
                </Box>

                <EditDialog
                    openDialog={this.state.openDialog}
                    closeDialog={this.closeDialog}
                    columns={this.state.columns}
                    row={this.state.list[this.state.selectedRow]}
                    handleRowUpdate={this.handleRowUpdate}
                />

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
                    }}
                    open={this.state.showSnackBar}
                    autoHideDuration={3000}
                    message={this.state.snackBarMessage}
                    onClose={() => this.setState({showSnackBar:false})}
                />

            </div>
        )
    }
}

export default withStyles(styles)(Logbook)