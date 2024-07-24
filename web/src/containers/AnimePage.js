import React from 'react'
import { Box, IconButton, List, ListItemButton } from '@mui/material'
import { Table, TableBody, TableRow, TableCell } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import LogbookPage from './LogbookPage'
import TabBar from '../components/TabBar'
import LogbookItemEditor from '../components/LogbookItemEditor'
import moment from 'moment'

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
    },
    statusCell: {
        padding: '0',
        textAlign: 'center'
    },
    statusLabel: {
        marginLeft: '10px',
        float: 'left'
    },
    counterLabel: {
        float: 'right'
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
            key = {`${key}-cell-${index}`}
            onClick = {this.handleTableCellClick.bind(this, index)}
        >
            {value !== undefined ? value : ''}
        </TableCell>
    }

    handleCounterUpClick = (index) => {
        let selectedEntry = this.state.list[index]
        let counter = this.counterHelper(selectedEntry['Watched'])
        if (counter.length === 1) {
            selectedEntry['Watched'] = `${counter[0] + 1}`
        }else {
            selectedEntry['Watched'] = `${counter[0] + 1}(${counter[1] + 1})`
        }
        const date = new Date()
        const formattedDate = moment(date).format('YY/MM/DD')
        selectedEntry['Date'] = formattedDate
        this.setState({
            entryIndex: index
        }, this.handleApplyEdits(selectedEntry, false))
    }

    statusCellHelper (finished, index) {
        if (finished) {
            return <TableCell
                sx = {styles.statusCell}
                key = {`Status-cell-${index}`}
                onClick = {this.handleTableCellClick.bind(this, index)}
            >
                終
            </TableCell>
        } else {
            return <TableCell
                sx = {styles.statusCell}
                key = {`Status-cell-${index}`}
                onClick = {this.handleCounterUpClick.bind(this, index)}
            >
                <IconButton
                    size = 'small'
                ><AddIcon fontSize = 'small'/></IconButton>
            </TableCell>
        }
    }

    counterHelper (str) {
        if (str === undefined || str === '' || str === '-') {
            return 0
        }
        let match = str.match(/(\d+)\((\d+)\)/)
        if (match) {
            return [parseInt(match[1]), parseInt(match[2])]
        }else {
            return [parseInt(str)]
        }
    }

    tableRowHelper (entry, index, filler = false) {
        let cells = []
        if (entry['AirDay'] !== undefined && entry['AirTime'] !== undefined) {
            cells.push(this.tableCellHelper('AirTime', entry['AirTime'], index))
        } else if (filler) {
            cells.push(this.tableCellHelper('AirTime', '', index))
        }
        cells.push(this.tableCellHelper('Title', entry['Title'], index))
        cells.push(this.tableCellHelper('Watched', `${entry['Watched']}`, index))
        let finished = this.counterHelper(entry['Watched'])[0] === this.counterHelper(entry['Total'])[0]
        cells.push(this.statusCellHelper(finished, index))
        cells.push(this.tableCellHelper('Date', entry['Date'], index))
        return <TableRow
                key = {`row-${index}`}
                selected = {this.state.entryIndex === index}
                >{cells}</TableRow>
    }

    prepareTable () {
        let airDays = []
        for (let i = 0; i < this.state.list.length; i++) {
            if (this.state.list[i] && this.state.list[i]['AirDay'] && !airDays.includes(this.state.list[i]['AirDay'])) {
                airDays.push(this.state.list[i]['AirDay'])
            }
        }
        let tableRows = []
        if (airDays.length > 0) {
            let displayedIndex = []
            for (let i = 0; i < airDays.length; i++) {
                tableRows.push(<TableRow key={`Airday-row-${i}`}>
                                <TableCell key={`Airday-cell-${i}`} colSpan={5}>
                                    {airDays[i]}
                                </TableCell>
                                </TableRow>)
                for (let j = 0; j < this.state.list.length; j++) {
                    if (this.state.list[j] && this.state.list[j]['AirDay'] === airDays[i]) {
                        tableRows.push(this.tableRowHelper(this.state.list[j], j))
                        displayedIndex.push(j)
                    }
                }
            }
            // Remaining entires
            if (displayedIndex.length !== this.state.list.length) {
                tableRows.push(<TableRow key={`Airday-row-unspecified`}>
                    <TableCell key={`Airday-cell-unspecified`} colSpan={5}>
                        Unspecified
                    </TableCell>
                    </TableRow>)
                for (let i = 0; i < this.state.list.length; i++) {
                    if (!displayedIndex.includes(i) && this.state.list[i]) {
                        tableRows.push(this.tableRowHelper(this.state.list[i], i, true))
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

    seasonListCounter (list) {
        let episodes = 0
        for (let i = 0; i < list.length; i++) {
            if (list[i]) {
                episodes += this.counterHelper(list[i]['Watched'])[0]
            }
        }
        return [list.length, episodes]
    }

    totalCouter () {
        let seasonSeries = 0
        let seasonEpisodes = 0
        let lifelongSeries = 0
        let lifelongEpisodes = 0
        for (let i = 0; i < this.state.segments.length; i++) {
            const listTotal = this.seasonListCounter(this.state.data[this.state.segments[i]])
            if (this.state.segmentIndex === i) {
                seasonSeries = listTotal[0]
                seasonEpisodes = listTotal[1]
            }
            lifelongSeries += listTotal[0]
            lifelongEpisodes += listTotal[1]
        }
        return <Box sx = {styles.counterLabel}>Season Series {seasonSeries}, Season Episodes {seasonEpisodes} <br/> 
        Lifelong Series {lifelongSeries}, Lifelong Episodes {lifelongEpisodes}</Box>
        
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
                        {!this.state.editMode ? this.totalCouter() : ''}
                        <Box sx={styles.statusText}>
                            {this.state.statusMessage}
                        </Box>
                </Box>
            </div>
            

        )
    }

}

export default AnimePage