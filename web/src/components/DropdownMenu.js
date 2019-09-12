import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})(props => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

class DropdownMenu extends Component {

    constructor (props) {
        super(props)
        this.state = {
            anchorEl: null,
        }
    }

    handleMenuClick = (event) => {
        this.setState(
            {anchorEl: event.currentTarget}
        )
    }
    
    handleMenuClose = () => {
        this.setState(
            {anchorEl: null}
        )
    }

    handleItemClick = (event) => {
        event.preventDefault()
        console.log(event)
        //this.props.setFunc(event.key)
    }

    render () {
        const items = []
        if (this.props.startValue <= this.props.endValue) {
            for (let i = this.props.startValue; i <= this.props.endValue; i++) {
                items.push(i)
            }
        }else{
            for (let i = this.props.startValue; i >= this.props.endValue; i--) {
                items.push(i)
            }
        }

        return (
            <div>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleMenuClick}
            >
              {this.props.selectedValue}
            </Button>
            <StyledMenu
              id="dropdown-menu"
              anchorEl={this.state.anchorEl}
              keepMounted
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleMenuClose}
            >
                {items}
            </StyledMenu>
          </div>
        )
    }
}

export default DropdownMenu