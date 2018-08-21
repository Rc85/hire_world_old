import fetch from 'axios';

export const LoginUser = (data) => {
    return dispatch => {
        dispatch(LoginBegin('login loading'));

        fetch.post('/api/auth/login', data)
        .then(resp => {
            if (resp.data.status === 'login success') {
                dispatch(LoginSuccess(resp.data.status, resp.data.user));
                location.herf = '/dashboard';
            } else if (resp.data.status === 'login fail') {
                dispatch(LoginFail(resp.data.status));
            } else if (resp.data.status === 'login error') {
                dispatch(LoginError(resp.data.status));
            }
        })
        .catch(err => console.log(err));
    }
}

const LoginBegin = (status) => {
    return {
        type: 'LOGIN_USER_BEGIN',
        status
    }
}

const LoginSuccess = (status, user) => {
    return {
        type: 'LOGIN_USER_SUCCESS',
        status,
        user
    }
}

const LoginFail = (status) => {
    return {
        type: 'LOGIN_USER_FAIL',
        status
    }
}

const LoginError = (status) => {
    return {
        type: 'LOGIN_USER_ERROR',
        status
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