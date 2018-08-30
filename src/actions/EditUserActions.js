import fetch from 'axios';

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
            }
        })
        .catch(err =>  console.log(err));
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