import React, {Component} from 'react'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"
import './App.css'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Diary from './containers/Diary'
import Logbook from './containers/Logbook'

const apiURL = 'http://127.0.0.1:2638'

class App extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <Router>
        <div className="App">
        <AppBar position="static">
          <Tabs value={window.location.pathname}>
            <Tab href= '/' label="Diary" value='/'/>
            <Tab href='logbook' label="Logbook" value='/logbook'/>
          </Tabs>
          </AppBar>
          <br />
          <Route exact path="/" render={()=>(<Diary apiURL={apiURL}/>)}/>
          <Route exact path="/logbook" render={()=>(<Logbook apiURL={apiURL}/>)}/>
        </div>
      </Router>
    )
  }
}

export default App
