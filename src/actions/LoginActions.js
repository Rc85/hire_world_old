import fetch from 'axios';
import { Alert } from '../actions/AlertActions';
import { LogError } from '../components/utils/LogError';
import { GetSession } from './FetchActions';

export const LoginUser = (data) => {
    return dispatch => {
        dispatch(LoginBegin('login begin'));

        return fetch.post('/api/auth/login', data)
        .then(resp => {
            if (resp.data.status === 'get session success') {
                dispatch(GetSession());
            } else if (resp.data.status === 'error') {
                dispatch(LoginError(resp.data.status, resp.data.statusMessage));
                dispatch(Alert(resp.data.status, resp.data.statusMessage));
            } else if (resp.data.status === 'access error') {
                dispatch(LoginError(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/auth/login'));
    }
}

const LoginBegin = (status) => {
    return {
        type: 'LOGIN_USER',
        status
    }
}

const LoginError = (status, message) => {
    return {
        type: 'LOGIN_USER_ERROR',
        status,
        message
    }
}

export const LogoutUser = () => {
    return dispatch => {
        fetch.post('/api/auth/logout')
        .then(resp => {
            if (resp.data.status === 'logged out') {
                dispatch(Logout(resp.data.status));
                location.href = '/app';
            }
        })
        .catch(err => LogError(err, '/api/auth/logout'));
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