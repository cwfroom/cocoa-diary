import React, {Component} from 'react'
import DropdownMenu from '../components/DropdownMenu'
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

class Diary extends Component {

    constructor (props) {
        super(props)
        const d = new Date()
        
        this.state = {
            firstYear: d.getFullYear(),
            currentYear: d.getFullYear(),
            selectedYear: d.getFullYear(),
            selectedMonth: d.getMonth() + 1,
            selectedDate: d.getDate(),
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
        };
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

    render () {

        const classes = makeStyles(theme => ({
            diaryRoot: {
              backgroundColor: theme.palette.background.paper,
            },
          }))

        return (
            <div className={classes.diaryRoot}>
                <DropdownMenu
                    startValue={this.state.currentYear}
                    endValue={this.state.firstYear}
                    selectedValue={this.state.selectedYear}
                    setFunc = {this.setSelectedYear}
                ></DropdownMenu>
                <DropdownMenu
                    startValue= {1}
                    endValue= {12}
                    selectedValue= {this.state.selectedMonth}
                    setFunc = {this.setSelectedMonth}
                ></DropdownMenu>

                <List>
                    {this.state.entryList.map( (entry, i) => 
                        <ListItem key={entry['Index']}>
                            {'[' + (this.state.selectedYear % 100) + this.twoDigits(this.state.selectedMonth) + 
                            this.twoDigits(entry['Day']) + '] ' + entry['Title']}
                        </ListItem>
                    )}
                </List>
            </div>
        )
    }
}

export default Diary