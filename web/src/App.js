import React, {Component} from 'react'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import Diary from './containers/Diary'
import Logbook from './containers/Logbook'
import Tools from './containers/Tools'
import LoginPage from './containers/LoginPage'
import { PrivateRoute } from './components/PrivateRoute'

class App extends Component {
  render () {
    return (
      <Router>
            <PrivateRoute exact path ='/' component={() => {return <Redirect to='diary'/>}}/>
            <Route exact path='/login' component={LoginPage}/>
            <PrivateRoute exact path='/diary' component={Diary}/>
            <PrivateRoute exact path='/logbook' component={Logbook}/>
            <PrivateRoute exact path='/tools' component={Tools}/>
      </Router>
    )
  }
}

export default App
