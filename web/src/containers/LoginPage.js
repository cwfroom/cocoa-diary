import React, { Component } from 'react'
import { Box, Paper, Typography, TextField, Button } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { Auth } from '../services/auth'

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
                if (status === 0) {
                    this.props.history.replace('/diary')
                    window.location.reload()
                }else {
                    this.setState({
                        isError: true
                    })
                }
            })
        }
    }

    render () {
        const {classes} = this.props
        return (
            <Paper className={classes.loginRoot}>
                <Box className={classes.formContainer}>
                    <TextField
                        fullWidth
                        autoFocus
                        error={this.state.isError}
                        className={classes.centerElement}
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

export default withStyles(styles)(LoginPage)
