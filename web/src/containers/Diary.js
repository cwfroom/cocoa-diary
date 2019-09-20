import React, {Component} from 'react'
import { withStyles } from '@material-ui/core/styles';
import { Box, TextField, List, ListItem, Snackbar } from '@material-ui/core'
import DropdownMenu from '../components/DropdownMenu'


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
        maxWidth: 'calc(100% - 260px)'
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
            selectedDay: 0,
            entryList: [
                {'Day': 0, 'Title': ''}
            ],
            currentContent: '',
            pendingChanges: {},
            showSnackBar: false,
            snackBarMessage: ''
        }
    }

    componentDidMount = () => {
        this.updateWindowHeight()
        window.addEventListener('resize', this.updateWindowHeight)
        document.addEventListener('keydown', this.hotkeyCreate, false)
        document.addEventListener('keydown', this.hotkeySubmit, false)

        fetch(this.props.apiURL + '/diary/firstyear', {
            method: 'POST',
        })
        .then( res => res.json())
        .then( (result) => {
            this.setState({
                firstYear: parseInt(result['FirstYear'])
            })
        })

        this.fetchMonth()
    }

    updateWindowHeight = () => {
        this.setState(
            {windowHeight: window.innerHeight}
        )
    }

    componentDidUpdate = (prevProps, prevState) => {
        // Fetch month
        if (prevState.selectedYear !== this.state.selectedYear || prevState.selectedMonth !== this.state.selectedMonth) {
            this.fetchMonth()
            this.setState({
                selectedIndex: 0
            })
        }
        // Fetch entry
        if (prevState.selectedIndex !== this.state.selectedIndex || this.state.currentContent === '') {
            this.fetchEntry()
        }
    }

    componentWillUnmount = () => {
        window.removeEventListener('resize', this.updateWindowHeight)
    }

    diaryFetch = (route, body, callback) => {
        const headers = {
            'Content-Type': 'application/json'
        }
        fetch(`${this.props.apiURL}/diary/${route}` , {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })
        .then( (res) => res.json())
        .then( (result) => {
            callback(result)
        })
    }

    fetchMonth = () => {
        const body = {
            'year': this.state.selectedYear,
            'month': this.state.selectedMonth
        }
        this.diaryFetch('month', body, (result) => {
            this.setState(
                {entryList: result}
            )
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
        this.updateChanges(name, event.target.value)
    }

    hotkeyCreate = (event) => {
        if (event.altKey && event.keyCode === 78) {
            this.createEntry()
        }
    }

    hotkeySubmit = (event) => {
        if (event.altKey && event.keyCode === 83) {
            this.submitChanges()
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
            if (!(state.selectedIndex in pendingChangesCopy)) {
                pendingChangesCopy[state.selectedIndex] = {}
            }
            pendingChangesCopy[state.selectedIndex][key] = value
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
                    snackBarMessage: result['Result'],
                    showSnackBar: true
                })
            })
            this.setState(
                {pendingChanges: {}}
            )
        }
        
    }

    render () {
        const {classes} = this.props
        return (
            <div className={classes.diaryRoot}>
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
                        </Box>
                </Box>

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

export default withStyles(styles)(Diary)