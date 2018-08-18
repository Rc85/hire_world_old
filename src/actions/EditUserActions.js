import fetch from 'axios';

export const EditUser = (type, value, user) => {
    return dispatch => {
        dispatch(EditUserBegin(`edit ${type} loading`, user));

        fetch.post('/api/edit/user', {type, value})
        .then(resp => {
            let success = /success$/;
            let fail = /fail$/;
            let error = /error$/;

            if (success.test(resp.data.status)) {
                dispatch(EditUserSuccess(resp.data.status, resp.data.user));
            } else if (fail.test(resp.data.status)) {
                dispatch(EditUserFail(resp.data.status, user));
            } else if (error.test(resp.data.error)) {
                dispatch(EditUserError(resp.data.status, user));
            }
        })
        .catch(err =>  console.log(err));
    }
}

const EditUserBegin = (status, user) => {
    return {
        type: 'EDIT_USER_BEGIN',
        status,
        user
    }
}

const EditUserSuccess = (status, user) => {
    return {
        type: 'EDIT_USER_SUCCESS',
        user,
        status
    }
}

const EditUserFail = (status, user) => {
    return {
        type: 'EDIT_USER_FAIL',
        status,
        user
    }
}

const EditUserError = (status, user) => {
    return {
        type: 'EDIT_USER_ERROR',
        status,
        user
    }
}

export const GetSession = () => {
    return dispatch => {
        fetch.post('/api/auth/get-session')
        .then(resp => {
            if (resp.data.status === 'get session success') {
                dispatch(GetSessionSuccess(resp.data.status, resp.data.user));
            }
        })
        .catch(err => console.log(err));
    }
}

const GetSessionSuccess = (status, user) => {
    return {
        type: 'GET_SESSION_SUCCESS',
        user,
        status
    }
}