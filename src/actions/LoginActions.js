import fetch from 'axios';
import { Alert } from '../actions/AlertActions';

export const LoginUser = (data) => {
    return dispatch => {
        dispatch(LoginBegin('Logging in'));

        return fetch.post('/api/auth/login', data)
        .then(resp => {
            if (resp.data.status === 'success') {
                dispatch(LoginSuccess(resp.data.user));
                location.herf = '/dashboard';
            } else if (resp.data.status === 'error') {
                dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => console.log(err));
    }
}

const LoginBegin = (status) => {
    return {
        type: 'LOGIN_USER',
        status
    }
}

const LoginSuccess = (user) => {
    return {
        type: 'LOGIN_USER_UPDATE',
        user
    }
}

export const LogoutUser = () => {
    return dispatch => {
        fetch.post('/api/auth/logout')
        .then(resp => {
            if (resp.data.status === 'logged out') {
                dispatch(Logout(resp.data.status));
                location.href = '/';
            }
        })
        .catch(err => console.log(err));
    }
}

const Logout = () => {
    return {
        type: 'LOGOUT_USER'
    }
}

export const UpdateUser = user => {
    return {
        type: 'USER_UPDATE',
        user
    }
}

export const ResetLogin = () => {
    return {
        type: 'LOGIN_USER_ERROR',
        status: null,
        statusMessage: null
    }
}