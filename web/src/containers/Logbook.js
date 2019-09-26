import React, {Component} from 'react'
import { withStyles } from '@material-ui/core/styles';
import { Box, List, ListItem, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

const styles = {
    leftPanel: {
        maxWidth: '250px',
        float: 'left',
        marginRight: '10px',
        padding: '0'
    },
    rightPanel: {
        marginLeft: '260px',
        maxWidth: 'calc(100% - 260px)'
    },
    categoryList: {
        marginTop: '5px',
        height: '80vh',
        overflow: 'auto'
    }
}


class Logbook extends Component {
    constructor (props) {
        super(props)

        this.state = {
            categories: [],
            selectedIndex: 0,
            columns: [],
            list: []
        }
    }

    componentDidMount = () => {
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
                                    <TableCell>{column}</TableCell>
                                )
                                }
                                </TableRow>
                            </TableHead>
                            {this.state.list.map( (entry, i) => 
                                <TableRow>
                                    {this.state.columns.map( (column) => 
                                        <TableCell>{entry[column]}</TableCell>
                                    )}
                                </TableRow>
                            )}
                        </Table>
                </Box>

            </div>
        )
    }
}

export default withStyles(styles)(Logbook)