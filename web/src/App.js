import React, {Component} from 'react'
import { PrivateRoute } from './components/PrivateRoute'
import { Navigate, BrowserRouter as Router, Route, Routes} from "react-router-dom"
import DiaryPage from './containers/DiaryPage'
import LogbookPage from './containers/LogbookPage'
import ToolsPage from './containers/ToolsPage'
import LoginPage from './containers/LoginPage'
import SearchPage from './containers/SearchPage'

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
                        <Route path='/diary' element={<DiaryPage/>}/>
                    </Route>
                    <Route path='/logbook' element={<PrivateRoute/>}>
                        <Route path='/logbook' element={<LogbookPage/>}/>
                    </Route>
                    <Route path='/search' element={<PrivateRoute/>}>
                        <Route path='/search' element={<SearchPage/>}/>
                    </Route>
                    <Route path='/tools' element={<PrivateRoute/>}>
                        <Route path='/tools' element={<ToolsPage/>}/>
                    </Route>
                </Routes>
      </Router>
    )
  }
}

export default App
