import fetch from 'axios';
import { Alert } from './AlertActions';
import { LogError } from '../components/utils/LogError';

export const EditUser = (type, value, user) => {
    return dispatch => {
        dispatch(EditUserBegin(`edit ${type} loading`, user));

        fetch.post('/api/user/edit', {type, value})
        .then(resp => {
            let success = /success$/;

            if (success.test(resp.data.status)) {
                dispatch(EditUserSuccess(resp.data.status, resp.data.user));
            } else {
                dispatch(EditUserError(resp.data.status, user));
                dispatch(Alert('error', 'An error occurred'));
            }
        })
        .catch(err =>  LogError(err, '/api/user/edit'));
    }
}

const EditUserBegin = (status, user) => {
    return {
        type: 'LOGIN_USER_UPDATE',
        status,
        user
    }
}

const EditUserSuccess = (status, user) => {
    return {
        type: 'LOGIN_USER_UPDATE',
        user,
        status
    }
}

const EditUserError = (status, user) => {
    return {
        type: 'LOGIN_USER_UPDATE',
        status,
        user
    }
}