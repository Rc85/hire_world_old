import fetch from 'axios';

export const RegisterUser = (data) => {
    return dispatch => {
        dispatch(RegisterBegin());

        fetch.post('/api/auth/register', data)
        .then(resp => {
            if (resp.data.status === 'register success') {
                dispatch(RegisterSuccess(resp.data.status));
            } else if (resp.data.status === 'register fail') {
                dispatch(RegisterFailed(resp.data.status));
            } else if (resp.data.status === 'register error') {
                dispatch(RegisterError(resp.data.status));
            }
        })
        .catch(err => console.log(err));
    }
}

const RegisterBegin = () => {
    return {
        type: 'REGISTER_USER_BEGIN',
        status: 'loading'
    }
}

const RegisterSuccess = (status) => {
    return {
        type: 'REGISTER_USER_SUCCESS',
        status
    }
}

const RegisterFailed = (status) => {
    return {
        type: 'REGISTER_USER_FAILED',
        status
    }
}

const RegisterError = (status) => {
    return {
        type: 'REGISTER_USER_ERROR',
        status
    }
}