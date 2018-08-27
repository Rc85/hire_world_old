import fetch from 'axios';

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

export const GetSectors = () => {
    return dispatch => {
        fetch.get('/api/get/sectors')
        .then(resp => {
            if (resp.data.status === 'get sectors success') {
                dispatch(StoreSectors(resp.data.status, resp.data.sectors));
            } else {
                dispatch(StoreSectorsError(resp.data.status));
            }
        })
        .catch(err => console.log(err));
    }
}

const StoreSectors = (status, sectors) => {
    return {
        type: 'STORE_SECTOR',
        sectors,
        status
    }
}

const StoreSectorsError = (status) => {
    return {
        type: 'STORE_SECTOR_ERROR',
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