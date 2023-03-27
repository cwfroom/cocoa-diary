import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Auth } from '../services/auth'

export const PrivateRoute = () => {
    const auth = Auth.isLoggedIn()
    return auth ? <Outlet /> : <Navigate to="/login" />
}