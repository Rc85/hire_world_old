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

export const GetCategories = () => {
    return dispatch => {
        fetch.get('/api/get/categories')
        .then(resp => {
            if (resp.data.status === 'get categories success') {
                dispatch(StoreCategories(resp.data.status, resp.data.categories));
            } else if (resp.data.status === 'get categories error') {
                dispatch(StoreCategoriesError(resp.data.status));
            }
        })
        .catch(err => console.log(err));
    }
}

const StoreCategories = (status, categories) => {
    return {
        type: 'STORE_CATEGORIES',
        categories,
        status
    }
}

const StoreCategoriesError = (status) => {
    return {
        type: 'STORE_CATEGORIES_ERROR',
        status
    }
}

export const GetServices = () => {
    return dispatch => {
        fetch.get('/api/get/services')
        .then(resp => {
            if (resp.data.status === 'get services success') {
                dispatch(UpdateServices(resp.data.status, resp.data.services));
            } else if (resp.data.status === 'get services error') {
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