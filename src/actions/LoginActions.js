import fetch from 'axios';
import { Alert } from '../actions/AlertActions';
import { LogError } from '../components/utils/LogError';
import { GetUserNotificationAndMessageCount } from './FetchActions';

export const LoginUser = (data) => {
    return dispatch => {
        dispatch(LoginBegin('login begin'));

        return fetch.post('/api/auth/login', data)
        .then(resp => {
            if (resp.data.status === 'success') {
                dispatch(LoginSuccess(resp.data.status, resp.data.user));
                dispatch(GetUserNotificationAndMessageCount());
            } else if (resp.data.status === 'error') {
                dispatch(LoginError(resp.data.status, resp.data.statusMessage));
                dispatch(Alert(resp.data.status, resp.data.statusMessage));
            } else if (resp.data.status === 'activation required') {
                dispatch(LoginError(resp.data.status, resp.data.statusMessage));
            } else if (resp.data.status === 'suspended' || resp.data.status === 'banned') {
                dispatch(LoginError('error', resp.data.statusMessage));
                dispatch(Alert('error', resp.data.statusMessage));
            } else if (resp.data.status === '2fa required') {
                dispatch(LoginError(resp.data.status, ''));
            }
        })
        .catch(err => {
            LogError(err, '/api/auth/login');
            dispatch(LoginError('error', 'An error occurred'));
        });   
    }
}

export const TwoFALogin = val => {
    return dispatch => {
        dispatch(LoginBegin('login begin'));

        return fetch.post('/api/auth/2fa/login', {code: val})
        .then(resp => {
            if (resp.data.status === 'success') {
                dispatch(LoginSuccess(resp.data.status, resp.data.user));
            } else if (resp.data.status === 'error') {
                dispatch(LoginError(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            LogError(err, '/api/auth/2fa/login');
            dispatch(LoginError('error', 'An error occurred'));
        })
    }
}

export const LoginBegin = (status) => {
    return {
        type: 'LOGIN_USER',
        status
    }
}

const LoginSuccess = (status, user) => {
    return {
        type: 'LOGIN_USER_UPDATE',
        user,
        status
    }
}

const LoginError = (status, statusMessage) => {
    return {
        type: 'LOGIN_USER_ERROR',
        status,
        statusMessage, 
        user: null
    }
}

export const LogoutUser = () => {
    return dispatch => {
        fetch.post('/api/auth/logout')
        .then(resp => {
            if (resp.data.status === 'error') {
                dispatch(Logout('not logged in'));
            }
        })
        .catch(err => LogError(err, '/api/auth/logout'));
    }
}

const Logout = (status) => {
    return {
        type: 'LOGOUT_USER',
        status
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