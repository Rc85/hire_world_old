import fetch from 'axios';

export const GetSession = () => {
    return dispatch => {
        dispatch(GetSessionBegin('getting session'));

        fetch.post('/api/auth/login')
        .then(resp => {
            if (resp.data.status === 'get session success') {
                dispatch(GetSessionSuccess(resp.data.status, resp.data.user, resp.data.messageCount, resp.data.notifications));
            } else {
                dispatch(GetSessionFail(resp.data.status, null));
            }
        })
        .catch(err => console.log(err));
    }
}

const GetSessionBegin = status => {
    return {
        type: 'LOGIN_USER',
        status
    }
}

const GetSessionSuccess = (status, user, messageCount, notifications) => {
    return {
        type: 'LOGIN_USER_UPDATE',
        user,
        status,
        messageCount,
        notifications
    }
}

const GetSessionFail = (status, user) => {
    return {
        type: 'LOGIN_USER_ERROR',
        user,
        status
    }
}

export const GetSectors = () => {
    return dispatch => {
        fetch.get('/api/get/sectors')
        .then(resp => {
            if (resp.data.status === 'get sectors success') {
                dispatch(UpdateSectors(resp.data.status, resp.data.sectors));
            } else {
                dispatch(UpdateSectorsError(resp.data.status));
            }
        })
        .catch(err => console.log(err));
    }
}

const UpdateSectors = (status, sectors) => {
    return {
        type: 'UPDATE_SECTORS',
        sectors,
        status
    }
}

const UpdateSectorsError = (status) => {
    return {
        type: 'UPDATE_SECTORS_ERROR',
        status
    }
}

export const UpdateUserNotifications = notifications => {
    return {
        type: 'UPDATE_NOTIFICATIONS',
        notifications
    }
}