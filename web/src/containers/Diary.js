import React, {Component} from 'react'
import { withStyles } from '@material-ui/core/styles';
import { Box, TextField, List, ListItem, Button } from '@material-ui/core'
import DropdownMenu from '../components/DropdownMenu'
import { setTimeout, clearTimeout } from 'timers'
import { Auth } from '../services/auth'
import TabBar from '../components/TabBar';

const styles = {
    diaryRoot: {
        maxHeight: '100vh'
    },
    leftPanel: {
        maxWidth: '250px',
        float: 'left',
        marginRight: '10px',
        padding: '0'
    },
    rightPanel: {
        marginLeft: '260px',
        maxWidth: 'calc(100% - 260px)',
        paddingRight: '10px'
    },
    inlineBox: {
        display: 'inline-block',
        marginLeft: '30px'
    },
    entryList: {
        marginTop: '5px',
        height: '80vh',
        overflow: 'auto'
    },
    narrowTextField: {
        float: 'left',
        maxWidth: '45px'
    },
    titleTextField: {
        width: 'calc(100% - 135px)'
    },
    contentTextField: {
        width: '100%',
        minHeight: '100%',
        fontFamily: '"Microsoft YaHei UI", "Roboto"',
        fontSize: '36px'
    },
    wordCountLabel: {
        float: 'left'
    },
    saveButton: {
        float: 'right'
    }
}

class Diary extends Component {

    constructor (props) {
        super(props)
        const d = new Date()
        
        this.state = {
            windowHeight: 0,
            firstYear: d.getFullYear(),
            currentYear: d.getFullYear(),
            selectedYear: d.getFullYear(),
            selectedMonth: d.getMonth() + 1,
            selectedIndex: 0,
            entryList: [],
            currentContent: '',
            pendingChanges: {},
            statusMessage: ''
        }
    }

    componentDidMount = () => {
        this.updateWindowHeight()
        window.addEventListener('resize', this.updateWindowHeight)
        document.addEventListener('keydown', this.hotKeys, false)
        this.autoSaveTimer = this.autoSave()

        this.diaryFetch('firstyear', {}, (result) => {
            this.setState({
                firstYear: parseInt(result['FirstYear'])
            })
        })

        this.fetchMonth(true)
    }

    updateWindowHeight = () => {
        this.setState(
            {windowHeight: window.innerHeight}
        )
    }

    componentDidUpdate = (prevProps, prevState) => {
        // On switching year, fetch new month
        if (prevState.selectedYear !== this.state.selectedYear || prevState.selectedMonth !== this.state.selectedMonth) {
            this.fetchMonth()
            this.setState({
                selectedIndex: 0
            })
        }
        // On switching entry, fetch new entry
        if (prevState.selectedIndex !== this.state.selectedIndex) {
            if (Object.keys(this.state.pendingChanges).length > 0){
                this.submitChanges()
            }
            this.fetchEntry()
        }
    }

    componentWillUnmount = () => {
        window.removeEventListener('resize', this.updateWindowHeight)
        document.removeEventListener('keydown', this.hotKeys)
    }

    diaryFetch = (route, body, callback) => {
        Auth.authedFetch('diary/'+route, body)
        .then(result => {
            if (result) callback(result)
        })
    }

    fetchMonth = (initialize) => {
        const body = {
            'year': this.state.selectedYear,
            'month': this.state.selectedMonth
        }
        this.diaryFetch('month', body, (result) => {
            this.setState(
                {entryList: result}
            )
            if (initialize && result.length > 0) {
                this.setState({
                    selectedIndex: result.length-1
                })
                if (result.length === 1) {
                    this.fetchEntry()
                }
            }
        })
    }

    fetchEntry = () => {
        const body = {
            'year': this.state.selectedYear,
            'month': this.state.selectedMonth,
            'index': this.state.selectedIndex
        }
        this.diaryFetch('entry', body, (result) => {
            this.setState(
                {currentContent: result['Content']}
            )
        })
    }

    setSelectedYear = (value) => {
        this.setState({
            selectedYear: value
        })
    }

    setSelectedMonth = (value) => {
        this.setState({
            selectedMonth: value
        })
    }

    twoDigits (value) {
        return ("0" + value).slice(-2)
    }

    handleEntryListClick = (value) => {
        this.setState(
            {selectedIndex: value}
        )
    }

    handleTextFieldUpdate = (name) => (event) => {
        if (name === 'Content') {
            this.setState({
                currentContent: event.target.value
            })
        } else {
            const value = event.target.value
            this.setState( (state) => {
                let entryListCopy = [...state.entryList]
                entryListCopy[state.selectedIndex][name] = value
                
                return {
                    ...state,
                    entryList: entryListCopy
                }
            }
            )
        }
        clearTimeout(this.autoSaveTimer)
        this.autoSaveTimer = this.autoSave()
        this.updateChanges(name, event.target.value)
    }

    hotKeys = (event) => {
        if (event.ctrlKey && event.altKey) {
            if (event.key === 'n' || event.key === 'N') {
                this.createEntry()
            }else if (event.key === 's' || event.key === 'S') {
                this.submitChanges()
            }
        }
    }

    createEntry = () => {
        this.setState( (state) => {
            const lastDay = (state.entryList.length > 0) ? state.entryList[state.entryList.length - 1]['Day'] : 0
            const modified = state.entryList.concat({
                'Day': lastDay + 1,
                'Title': ''
            })

            return {
                ...state,
                entryList: modified,
                selectedIndex: modified.length - 1
            }
        }, () => {
            this.updateChanges('Day', this.state.entryList[this.state.entryList.length - 1]['Day'])
        })
    }

    updateChanges = (key, value) => {
        this.setState( (state) => {
            let pendingChangesCopy = state.pendingChanges
            if (!pendingChangesCopy['Index']) {
                pendingChangesCopy['Index'] = this.state.selectedIndex
            }
            pendingChangesCopy[key] = value
            return {
                ...state,
                pendingChanges: pendingChangesCopy
            }
        })
    }

    submitChanges = () => {
        if (Object.entries(this.state.pendingChanges).length !== 0){
            const body = {
                'year': this.state.selectedYear,
                'month': this.state.selectedMonth,
                'changes': this.state.pendingChanges
            }
            this.diaryFetch('submit', body, (result) => {
                this.setState({
                    statusMessage: result['Result']
                })
            })
            this.setState(
                {pendingChanges: {}}
            )
        }

    }

    autoSave = () => {
        return setTimeout(this.submitChanges, 10000)
    }

    render () {
        const {classes} = this.props
        return (
            <div className={classes.diaryRoot}>
                <TabBar/>
                <br />
                <Box className={classes.leftPanel}>
                    <Box className = {classes.inlineBox}>
                        <DropdownMenu 
                            startValue={this.state.currentYear}
                            endValue={this.state.firstYear}
                            selectedValue={this.state.selectedYear}
                            setFunc = {this.setSelectedYear}
                        ></DropdownMenu>
                    </Box>
                    <Box className = {classes.inlineBox}>
                        <DropdownMenu
                            startValue= {1}
                            endValue= {12}
                            selectedValue= {this.state.selectedMonth}
                            setFunc = {this.setSelectedMonth}
                        ></DropdownMenu>
                    </Box>
                <List className={classes.entryList}>
                    {this.state.entryList.map( (entry, i) => 
                        <ListItem
                            button
                            selected = {this.state.selectedIndex === i}
                            key={i}
                            onClick={this.handleEntryListClick.bind(this, i)}
                        >
                            { (entry['Day'] !== 0) ? '[' + this.twoDigits(this.state.selectedYear % 100) + this.twoDigits(this.state.selectedMonth) + 
                            this.twoDigits(entry['Day']) + '] ' + entry['Title'] : entry['Title']}
                        </ListItem>
                    )}
                    <ListItem
                        button
                        onClick={this.createEntry}
                    >
                        New...
                    </ListItem>
                </List>
                </Box>

                <Box className={classes.rightPanel}>
                        <TextField
                            disabled
                            className={classes.narrowTextField}
                            id='year-textfield'
                            variant='outlined'
                            value={this.twoDigits(this.state.selectedYear % 100)}
                        />
                        <TextField
                            disabled
                            className={classes.narrowTextField}
                            id='month-textfield'
                            variant='outlined'
                            value={this.twoDigits(this.state.selectedMonth)}
                        />
                        <TextField
                            className={classes.narrowTextField}
                            id='day-textfield'
                            variant='outlined'
                            value={this.state.entryList[this.state.selectedIndex] ? this.twoDigits(this.state.entryList[this.state.selectedIndex]['Day']): '00'}
                            onChange={this.handleTextFieldUpdate('Day')}
                        />
                        <TextField
                            className={classes.titleTextField}
                            id='title-textfield'
                            variant='outlined'
                            value={this.state.entryList[this.state.selectedIndex] ? this.state.entryList[this.state.selectedIndex]['Title'] : ''}
                            onChange={this.handleTextFieldUpdate('Title')}
                        />
                        <br />
                        <TextField
                            multiline
                            rows={this.state.windowHeight / 30}
                            className={classes.contentTextField}
                            id='content-textfield'
                            variant='outlined'
                            value={this.state.currentContent ? this.state.currentContent : ''}
                            onChange={this.handleTextFieldUpdate('Content')}
                        />
                        <br />
                        <Box className={classes.wordCountLabel}>
                            Word Count: {this.state.currentContent ? this.state.currentContent.length : 0}
                            <br />
                            {this.state.statusMessage}
                        </Box>
                        <Box className={classes.saveButton}>
                            <Button
                                variant='contained'
                                color="primary"
                                onClick={this.submitChanges}
                                disabled={Object.keys(this.state.pendingChanges).length === 0}
                            >
                                Save
                            </Button>
                        </Box>
                </Box>
            </div>
        )
    }
}

export default withStyles(styles)(Diary)