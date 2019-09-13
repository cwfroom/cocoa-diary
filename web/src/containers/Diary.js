import React, {Component} from 'react'
import DropdownMenu from '../components/DropdownMenu'
import { withStyles } from '@material-ui/styles';
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import { Box } from '@material-ui/core'

const styles = {
    inlineButton: {
        
    },
    diaryRoot: {
      
    },
    leftPanel: {
        maxWidth: '200px'
    }
}

class Diary extends Component {

    constructor (props) {
        super(props)
        const d = new Date()
        
        this.state = {
            firstYear: d.getFullYear(),
            currentYear: d.getFullYear(),
            selectedYear: d.getFullYear(),
            selectedMonth: d.getMonth() + 1,
            selectedIndex: 0,
            entryList: []
        }
    }

    componentDidMount = () => {
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

    componentDidUpdate = (prevProps, prevState) => {
        // Fetch month
        if (prevState.selectedYear !== this.state.selectedYear || prevState.selectedMonth !== this.state.selectedMonth) {
            this.fetchMonth()
        }
    }

    fetchMonth = () => {
        const headers = {
            'Content-Type': 'application/json'
        }
        const body = {
            'year': this.state.selectedYear,
            'month': this.state.selectedMonth
        }
        
        fetch(this.props.apiURL + '/diary/month', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })
        .then( (res) => res.json())
        .then( (result) => {
            this.setState(
                {entryList: result}
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

    render () {
        const {classes} = this.props
        return (
            <div className={classes.diaryRoot}>
                <Box className={classes.leftPanel}>
                <DropdownMenu
                    className = {classes.inlineButton}
                    startValue={this.state.currentYear}
                    endValue={this.state.firstYear}
                    selectedValue={this.state.selectedYear}
                    setFunc = {this.setSelectedYear}
                ></DropdownMenu>
                <DropdownMenu
                    className = {classes.inlineButton}
                    startValue= {1}
                    endValue= {12}
                    selectedValue= {this.state.selectedMonth}
                    setFunc = {this.setSelectedMonth}
                ></DropdownMenu>

                <List>
                    {this.state.entryList.map( (entry, i) => 
                        <ListItem
                            button
                            selected = {this.state.selectedIndex === entry['Index']}
                            key={entry['Index']}
                            onClick={this.handleEntryListClick.bind(this, entry['Index'])}
                        >
                            {'[' + (this.state.selectedYear % 100) + this.twoDigits(this.state.selectedMonth) + 
                            this.twoDigits(entry['Day']) + '] ' + entry['Title']}
                        </ListItem>
                    )}
                </List>
                </Box>
            </div>
        )
    }
}

export default withStyles(styles)(Diary)