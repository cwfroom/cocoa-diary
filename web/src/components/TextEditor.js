import React, {Component} from 'react'
import { Box, TextField } from '@mui/material'

const styles = {
    contentTextField: {
        width: '100%',
        minHeight: '100%',
        fontFamily: '"Microsoft YaHei UI", "Roboto"',
        fontSize: '36px'
    },
    wordCountLabel: {
        float: 'left'
    },
    buttons: {
        float: 'right'
    }
}

class TextEditor extends Component {
    /*
        Required props
        text
        onChange
        elementsForLinesCalc
    */
    constructor (props) {
        super(props)
        this.state = {
            windowHeight: 0
        }
    }

    componentDidMount = () => {
        this.updateWindowHeight()
        window.addEventListener('resize', this.updateWindowHeight)
    }

    componentWillUnmount = () => {
        window.removeEventListener('resize', this.updateWindowHeight)
    }

    updateWindowHeight = () => {
        this.setState(
            {windowHeight: window.innerHeight}
        )
    }

    render () {
        return (
            <div>
                <Box>
                    <TextField
                        multiline
                        rows={this.state.windowHeight / 30}
                        sx={styles.contentTextField}
                        id='content-textfield'
                        variant='outlined'
                        value={this.props.text ? this.props.text : ''}
                        onChange={this.props.onChange}
                    />
                </Box>
                <Box sx={styles.wordCountLabel}>
                    Word Count: {this.props.text ? this.props.text.length : 0}
                </Box>
            </div>
        )
    }
}

export default TextEditor