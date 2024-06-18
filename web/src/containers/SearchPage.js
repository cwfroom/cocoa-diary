import React, {Component} from 'react'
import { Box, TextField, Button, List, ListItem } from '@mui/material'
import TabBar from '../components/TabBar'
import { Auth } from '../services/auth'

const styles = {
    keywordTextField: {
        margin: '20px',
        float: 'left'
    },
    searchButton: {
        margin: '20px 10px',
        float: 'left'
    }
}

class SearchPage extends Component {

    constructor (props) {
        super(props)
        this.state = {
            keyword: '',
            searchResult: []
        }
    }

    handleTextfieldChange = (event) => {
        this.setState({
            keyword: event.target.value
        })
    }

    searchFetch = (body, callback) => {
        Auth.authedFetch('diary/search', body)
        .then(result => {
            if (result) callback(result)
        })
    }

    executeSearch = () => {
        if (this.state.keyword !== '') {
            this.searchFetch({'keyword': this.state.keyword}, (result) => {
                this.setState({
                    searchResult: result
                })
            })
        }
    }

    onClickSearchButton = (event) => {
        this.executeSearch()
    }

    handlePressEnter = (event) => {
        if (event.key === 'Enter') {
            this.executeSearch()
        }
    }

    onClickClearButton = (event) => {
        this.setState({
            keyword: '',
            searchResult: []
        })
    }

    render () {
        return (
            <div>
                <TabBar/>
                <Box
                    sx={{display: 'block'}}
                >
                    <TextField
                        id='keyword-textfield'
                        value={this.state.keyword}
                        onChange={this.handleTextfieldChange}
                        onKeyDown={this.handlePressEnter}
                        size='small'
                        sx={styles.keywordTextField}
                    />
                    <Button
                        onClick={this.onClickSearchButton}
                        variant='contained'
                        color="primary"
                        sx={styles.searchButton}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={this.onClickClearButton}
                        variant='contained'
                        color="primary"
                        sx={styles.searchButton}
                    >
                        Clear
                    </Button>
                </Box>
                <Box
                    sx={{display: 'block', marginTop: '70px'}}
                >
                <List>
                    <ListItem>
                        {this.state.searchResult.length + ' results.'} 
                    </ListItem>
                    {this.state.searchResult.map( (entry, i) => 
                        <ListItem
                            key = {'search-result-item'+entry['Date']}
                        >
                            {entry['Date'] + ' ' + entry['Title'] + '\n'}
                            <br/>
                            {entry['Digest']}
                        </ListItem>
                    )}
                </List>
                </Box>
            </div>
        )
    }
}

export default SearchPage