import { globals } from './globals'
import decode from 'jwt-decode'

async function login (password) {
    const res = await fetch(`${globals.apiURL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password })
    })
    const result = await res.json()
    if (result.status === 0) {
        localStorage.setItem('token', result.token);
    }
    return result.status
    }
    
function logout () {
    localStorage.removeItem('token')
}
    
function isLoggedIn () {
    const token = localStorage.getItem('token')
    return (token && !isTokenExpired(token))
}

function isTokenExpired (token) {
    const decoded = decode(token)
    return (decode.exp < Date.now() / 1000)
}

export const Auth = {
    login,
    logout,
    isLoggedIn
}