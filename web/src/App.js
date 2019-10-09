import React, {Component} from 'react'
import { BrowserRouter as Router, Route, Redirect} from 'react-router-dom'
import { AppBar, Tabs, Tab, Button } from '@material-ui/core'
import Diary from './containers/Diary'
import Logbook from './containers/Logbook'
import LoginPage from './containers/LoginPage'
import { Auth } from './services/auth'

class App extends Component {
  render () {
    return (
      <Router>
        <div className='App'>

        <AppBar position='static'>
        {Auth.isLoggedIn() && 
            <Tabs value={window.location.pathname}>
              <Tab href='diary' label='Diary' value='/diary'/>
              <Tab href='logbook' label='Logbook' value='/logbook'/>
              <Button
                color='inherit'
                onClick={Auth.logout}
              >
                Logout
              </Button>
            </Tabs>
        }
        </AppBar>
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
