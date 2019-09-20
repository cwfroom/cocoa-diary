import React, {Component} from 'react'
import './App.css'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Diary from './containers/Diary'
import Logbook from './containers/Logbook'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

const apiURL = 'http://127.0.0.1:2638'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentTab : 0
    }
  }
  
  handleChange = (event, newValue) => {
    this.setState({
      currentTab: newValue
    })
}


  render () {
    
    return (
      <div className="App">
      <AppBar position="static">
        <Tabs value={this.state.currentTab} onChange={this.handleChange}>
          <Tab label="Diary" value={0}/>
          <Tab label="Logbook" value={1}/>
        </Tabs>
        </AppBar>
        <TabPanel value={this.state.currentTab} index={0}>
          <Diary apiURL={apiURL}/>
        </TabPanel>
        <TabPanel value={this.state.currentTab} index={1}>
          <Logbook apiURL={apiURL}/>
        </TabPanel>
      </div>
    )
  }
}

export default App
