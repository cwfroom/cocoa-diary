import React, {Component} from 'react'
import { PrivateRoute } from './components/PrivateRoute'
import { Navigate, BrowserRouter as Router, Route, Routes} from "react-router-dom"
import Diary from './containers/Diary'
import Logbook from './containers/Logbook'
import Tools from './containers/Tools'
import LoginPage from './containers/LoginPage'

class App extends Component {
    render () {
        return (
            <Router>
                <Routes>
                    <Route path='/login' element={<LoginPage/>}/>
                    <Route path='/' element={<PrivateRoute/>}>
                        <Route path='/' element={<Navigate to="/diary" />}/>
                    </Route>
                    <Route path='/diary' element={<PrivateRoute/>}>
                        <Route path='/diary' element={<Diary/>}/>
                    </Route>
                    <Route path='/logbook' element={<PrivateRoute/>}>
                        <Route path='/logbook' element={<Logbook/>}/>
                    </Route>
                    <Route path='/tools' element={<PrivateRoute/>}>
                        <Route path='/tools' element={<Tools/>}/>
                    </Route>
                </Routes>
      </Router>
    )
  }
}

export default App
