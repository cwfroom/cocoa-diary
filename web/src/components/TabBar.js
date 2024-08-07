import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import { AppBar, Tabs, Tab, Button, Toolbar } from '@mui/material'
import {Auth} from '../services/auth'

export default class TabBar extends Component{
    render () {
        return (
            <AppBar position='static'>
            <Toolbar variant='dense'>
            <Tabs value={window.location.pathname}
                style={{flex: 1}}
                textColor="inherit"
                indicatorColor="secondary"
            >
                <Tab component={Link} to='/diary' label='Diary' value='/diary'/>
                <Tab component={Link} to='/logbook' label='Logbook' value='/logbook'/>
                <Tab component={Link} to='/anime' label='Anime' value='/anime'/>
                <Tab component={Link} to='/search' label='Search' value='/search'/>
                <Tab component={Link} to='/tools' label='Tools' value='/tools'/>
            </Tabs>
            <Button
                color='inherit'
                onClick={
                    Auth.isLoggedIn() ? Auth.logout : (() => window.location.replace('/login'))
                }
            >
                {Auth.isLoggedIn() ? 'Logout' : 'Login'}
            </Button>
            </Toolbar>
            </AppBar>
        )
    }
}
