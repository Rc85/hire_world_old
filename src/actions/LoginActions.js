import fetch from 'axios';

export const LoginUser = (data) => {
    return dispatch => {
        dispatch(LoginBegin('Logging in'));

        return fetch.post('/api/auth/login', data)
        .then(resp => {
            console.log(resp);
            if (resp.data.status === 'success') {
                dispatch(LoginSuccess(resp.data.status, resp.data.user, resp.data.statusMessage));
                location.herf = '/dashboard';
            } else if (resp.data.status === 'error') {
                dispatch(LoginError(resp.data.status, resp.data.statusMessage));
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

const LoginSuccess = (status, user, statusMessage) => {
    return {
        type: 'LOGIN_USER_UPDATE',
        status,
        statusMessage,
        user
    }
}

const LoginError = (status, statusMessage) => {
    return {
        type: 'LOGIN_USER_ERROR',
        status,
        statusMessage
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