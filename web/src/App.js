import React, {Component} from 'react'
import { BrowserRouter as Router, Route, Redirect} from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Diary from './containers/Diary'
import Logbook from './containers/Logbook'
import LoginPage from './containers/LoginPage'
import { Auth } from './services/auth'

class App extends Component {
  render () {
    return (
      <Router>
        <div className='App'>
        <Route path='/' render={() => {
          if (!Auth.isLoggedIn()) {
            return <Redirect to={{pathname:'/login'}}/>
          }
        }}
        />
        
        {Auth.isLoggedIn() &&
          <AppBar position='static'>
            <Tabs value={window.location.pathname}>
              <Tab href='diary' label='Diary' value='/diary'/>
              <Tab href='logbook' label='Logbook' value='/logbook'/>
            </Tabs>
            </AppBar>
          }
          <br />
            <Route exact path='/login' component={LoginPage}/>
            <Route exact path='/diary' component={Diary}/>
            <Route exact path='/logbook' component={Logbook}/>
        </div>
      </Router>
    )
  }
}

export default App
