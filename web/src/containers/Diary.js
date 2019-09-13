import React, {Component} from 'react'
import DropdownMenu from '../components/DropdownMenu'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

class Diary extends Component {

    constructor (props) {
        super(props)
        const d = new Date()
        
        this.state = {
            firstYear: d.getFullYear(),
            currentYear: d.getFullYear(),
            selectedYear: d.getFullYear(),
            selectedMonth: d.getMonth() + 1,
            selectedDate: d.getDate()
        }
    }

    componentDidMount = () => {
        fetch(this.props.apiURL + '/diary/firstyear', {
            method: 'POST',
        })
        .then( res => res.json())
        .then( (result) => {
            this.setState({
                firstYear: result['FirstYear']
            })
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

    render () {
        return (
            <div>
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

                </List>
            </div>
        )
    }
}

export default Diary