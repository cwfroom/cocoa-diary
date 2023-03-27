import React, { Component } from 'react'
import { Box, Paper, TextField } from '@mui/material'
import { Auth } from '../services/auth'
import { Navigate } from 'react-router-dom'

const styles = {
    loginRoot: {
        margin: '20vh auto',
        width: '320px'
    },
    formContainer : {
        padding: '20px',
    },
    centerElement: {
        margin: 'auto',
        display: 'block'
    }
}

class LoginPage extends Component {
    constructor (props) {
        super(props)
        this.state = {
            password: '',
            isError: false
        }
    }

    handleTextFieldUpdate = (event) => {
        this.setState({
            password: event.target.value
        })
    }

    handlePressEnter = (event) => {
        if (event.key === 'Enter') {
            Auth.login(this.state.password)
            .then( status => {
                if (status !== 0) {
                    this.setState({
                        isError: true
                    })
                }
            })
        }
    }

    render () {
        return (
            <Paper sx={styles.loginRoot}>
                {Auth.isLoggedIn() && (
                    <Navigate to="/" replace={true} />
                )}
                <Box sx={styles.formContainer}>
                    <TextField
                        fullWidth
                        autoFocus
                        error={this.state.isError}
                        sx={styles.centerElement}
                        variant='outlined'
                        type='password'
                        label='Password'
                        value={this.state.password}
                        onChange={this.handleTextFieldUpdate}
                        onKeyDown={this.handlePressEnter}
                    />
                </Box>
            </Paper>
        )
    }
}

export default LoginPage
