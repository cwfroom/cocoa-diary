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
            currentMonth: d.getMonth() + 1,
            currentdate: d.getDate()
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

    setCurrentYear = (value) => {
        this.setState({
            currentYear: value
        })
    }

    setCurrentMonth = (value) => {
        this.setState(
            {
                currentMonth: value
            }
        )
    }

    render () {
        return (
            <div>
                <DropdownMenu
                    startValue={this.state.currentYear}
                    endValue={this.state.firstYear}
                    selectedValue={this.state.currentYear}
                    setFunc = {this.setCurrentYear}
                ></DropdownMenu>
                <DropdownMenu
                    startValue= {1}
                    endValue= {12}
                    selectedValue= {this.state.currentMonth}
                    setFunc = {this.setCurrentMonth}
                ></DropdownMenu>

                <List>

                </List>
            </div>
        )
    }
}

export default Diary