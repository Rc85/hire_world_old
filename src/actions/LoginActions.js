import fetch from 'axios';

export const LoginUser = (data) => {
    return dispatch => {
        dispatch(LoginBegin('Logging in'));

        fetch.post('/api/auth/login', data)
        .then(resp => {
            if (resp.data.status === 'Login success') {
                dispatch(LoginSuccess(resp.data.status, resp.data.user));
                location.herf = '/dashboard';
            } else {
                dispatch(LoginError(resp.data.status));
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

const LoginSuccess = (status, user) => {
    return {
        type: 'LOGIN_USER_UPDATE',
        status,
        user
    }
}

const LoginError = (status) => {
    return {
        type: 'LOGIN_USER',
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

export const ResetLoginStatus = user => {
    return {
        type: 'RESET_STATUS',
        user
    }
}