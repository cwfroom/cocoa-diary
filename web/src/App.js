import React, {Component} from 'react'
import { BrowserRouter as Router, Route, Redirect, Link} from 'react-router-dom'
import { AppBar, Tabs, Tab, Button, Toolbar } from '@material-ui/core'
import Diary from './containers/Diary'
import Logbook from './containers/Logbook'
import LoginPage from './containers/LoginPage'
import { Auth } from './services/auth'

class App extends Component {
  render () {
    return (
      <Router>
        <div className='App'>

        {Auth.isLoggedIn() && 
        <AppBar position='static'>
            <Toolbar variant='dense'>
              <Tabs value={window.location.pathname} style={{flex: 1}}>
                <Tab component={Link} to='/diary' label='Diary' value='/diary'/>
                <Tab component={Link} to='/logbook' label='Logbook' value='/logbook'/>
              </Tabs>
              <Button
                  color='inherit'
                  onClick={Auth.logout}
              >
                Logout
              </Button>
            </Toolbar>
        </AppBar>
        }
          <br />
            <Route path='/' render={() => {
              if (!Auth.isLoggedIn()) {
                return <Redirect to={{pathname:'/login'}}/>
              }
            }}
            />
            <Route exact path='/login' component={LoginPage}/>
            <Route exact path='/diary' component={Diary}/>
            <Route exact path='/logbook' component={Logbook}/>
        </div>
      </Router>
    )
  }
}

export default App
