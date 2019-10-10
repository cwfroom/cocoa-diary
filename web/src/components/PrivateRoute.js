import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { Auth } from '../services/auth'

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => {
        if (!Auth.isLoggedIn()) {
            return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        }else{
            return <Component {...props} />
        }
    }}/>
)