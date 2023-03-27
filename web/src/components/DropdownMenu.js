import React, { Component } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';

/*
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
*/

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

    handleItemClick = (value) => {
        this.props.setFunc(value.item)
        this.handleMenuClose()
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
            <Menu
              id="dropdown-menu"
              anchorEl={this.state.anchorEl}
              keepMounted
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleMenuClose}
            >
                {items.map( (item, i) => 
                  <MenuItem key={i} onClick={this.handleItemClick.bind(this, {item})}>{item}</MenuItem>
                )}
            </Menu>
          </div>
        )
    }
}

export default DropdownMenu