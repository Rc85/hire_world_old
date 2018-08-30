import fetch from 'axios';

export const GetSession = () => {
    return dispatch => {
        fetch.post('/api/auth/get-session')
        .then(resp => {
            if (resp.data.status === 'get session success') {
                dispatch(GetSessionSuccess(resp.data.status, resp.data.user));
            } else {
                dispatch(GetSessionFail(resp.data.status, null));
            }
        })
        .catch(err => console.log(err));
    }
}

const GetSessionSuccess = (status, user) => {
    return {
        type: 'LOGIN_USER_UPDATE',
        user,
        status
    }
}

const GetSessionFail = (status, user) => {
    return {
        type: 'LOGIN_USER_UPDATE',
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

export const GetServices = () => {
    return dispatch => {
        fetch.get('/api/get/services')
        .then(resp => {
            if (resp.data.status === 'get services success') {
                dispatch(UpdateServices(resp.data.status, resp.data.services));
            } else {
                dispatch(UpdateServicesError(resp.data.status));
            }
        });
    }
}

const UpdateServices = (status, services) => {
    return {
        type: 'UPDATE_SERVICES',
        status,
        services
    }
}

const UpdateServicesError = status => {
    return {
        type: 'UPDATE_SERVICES_ERROR',
        status
    }
}