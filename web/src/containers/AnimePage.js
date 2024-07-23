import React, {Component} from 'react'
import { Box, List, ListItemButton } from '@mui/material'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'
import LogbookPage from './LogbookPage'
import TabBar from '../components/TabBar'
import LogbookItemEditor from '../components/LogbookItemEditor'

const styles = {
    leftPanel: {
        maxWidth: '120px',
        float: 'left',
        marginRight: '10px',
        padding: '0'
    },
    rightPanel: {
        marginLeft: '120px',
        maxWidth: 'calc(100% - 140px)',
        paddingRight: '10px',
    },
    categoryList: {
        marginTop: '5px',
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'auto'
    },
    tableContainer: {
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto'
    }
}

class AnimePage extends LogbookPage {
    constructor (props) {
        super(props)

        this.state = {
            categories: ['Anime'],
            categoryIndex: 0,
            columns: [],
            data: {},
            list: [],
            editMode: false,
            segments: [],
            segmentIndex: 0,
            entryIndex: null,
            activeEntry: null,
            statusMessage: ''
        }
    }

    componentDidMount = () => {
        document.addEventListener('keydown', this.hotKeys, false)
        const body = {
            category : this.state.categories[this.state.categoryIndex]
        }
        this.logbookFetch('category', body, (result) => {
            this.setState({
                columns: result['Columns'],
                data: result['List'],
                segments: Object.keys(result['List'])
            }, this.switchSegment)
        })
    }

    handleSegmentListClick = (value) => {
        this.setState({
            segmentIndex: value,
            editMode: false
        }, this.switchSegment)
    }

    switchSegment () {
        this.setState({
            list: this.state.data[this.state.segments[this.state.segmentIndex]]
        })
    }

    tableCellHelper(key, value, index) {
        return <TableCell
            id = {`${key}-cell-${index}`}
            onClick = {this.handleTableCellClick.bind(this, index)}
        >
            {value}
        </TableCell>
    }

    tableRowHelper (entry, index) {
        let cells = []
        if (entry['AirDay'] && entry['AirTime']) {
            cells.push(this.tableCellHelper('AirTime', entry['AirTime'], index))
        }
        cells.push(this.tableCellHelper('Title', entry['Title'], index))
        cells.push(this.tableCellHelper('Watched', entry['Watched'], index))
        cells.push(this.tableCellHelper('Date', entry['Date'], index))
        return <TableRow
                key = {`row-${index}`}
                selected = {this.state.entryIndex === index}
                >{cells}</TableRow>
    }

    prepareTable () {
        let airDays = []
        for (let i = 0; i < this.state.list.length; i++) {
            if (this.state.list[i]['AirDay'] && !airDays.includes(this.state.list[i]['AirDay'])) {
                airDays.push(this.state.list[i]['AirDay'])
            }
        }
        let tableRows = []
        if (airDays.length > 0) {
            for (let i = 0; i < airDays.length; i++) {
                tableRows.push(<TableRow key={`Airday-row-${i}`}>
                                <TableCell key={`Airday-cell-${i}`} colSpan={4}>
                                    {airDays[i]}
                                </TableCell>
                                </TableRow>)
                for (let j = 0; j < this.state.list.length; j++) {
                    if (this.state.list[j]['AirDay'] === airDays[i]) {
                        tableRows.push(this.tableRowHelper(this.state.list[j], j))
                    }
                }
            }
        } else {
            for (let i = 0; i < this.state.list.length; i++) {
                tableRows.push(this.tableRowHelper(this.state.list[i], i))
            }
        }
        return (
            tableRows
        )
    }

    render () {
        return (
            <div>
                <TabBar/>
                <br />
                <Box sx = {styles.leftPanel}>
                    <List sx={styles.categoryList}>
                        {this.state.segments.map( (segment, i) => 
                            <ListItemButton
                                selected = {this.state.segmentIndex === i}
                                key={i}
                                onClick={this.handleSegmentListClick.bind(this, i)}
                            >
                                {segment}
                            </ListItemButton>
                        )}
                    </List>
                </Box>

                <Box sx={styles.rightPanel}>
                    {!this.state.editMode ? 
                        <Box sx={styles.tableContainer}>
                            <Table
                                size='small'
                            >
                                <TableBody>
                                <TableRow>
                                    <TableCell onClick={this.createEntry}>New...</TableCell>
                                </TableRow>
                                {this.prepareTable()}
                                </TableBody>
                            </Table>
                        </Box>
                        :
                        <LogbookItemEditor
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

export default AnimePage