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
        window.location.replace('/')
    }
        return result.status
    }
    
function logout () {
    localStorage.removeItem('token')
    window.location.replace('/')
}

function isLoggedIn () {
    const token = localStorage.getItem('token')
    return (token && !isTokenExpired(token))
}

function isTokenExpired (token) {
    const decoded = decode(token)
    return (decoded.exp < Date.now() / 1000)
}

async function authedFetch (route, body) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
    return fetch(`${globals.apiURL}/${route}` , {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    })
    .then( (res) => {
        if (res.status !== 200){
            return null
        }else {
            return res.json()
        }
    })
}

export const Auth = {
    login,
    logout,
    isLoggedIn,
    authedFetch
}