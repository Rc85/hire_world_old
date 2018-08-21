import fetch from 'axios';

export const AddService = (data) => {
    return dispatch => {
        dispatch(AddServiceBegin('add service loading'));

        fetch.post('/api/user/services/add', data)
        .then(resp => {
            if (resp.data.status === 'add service success') {
                dispatch(AddServiceSuccess(resp.data.status, resp.data.services));
            } else if (resp.data.status === 'add service fail') {
                dispatch(AddServiceFail(resp.data.status));
            } else if (resp.data.status === 'add service error') {
                dispatch(AddServiceError(resp.data.status));
            }
        });
    }
}

const AddServiceBegin = status => {
    return {
        type: 'ADD_SERVICE_BEGIN',
        status
    }
}

const AddServiceSuccess = (status, services) => {
    return {
        type: 'ADD_SERVICE_SUCCESS',
        services,
        status
    }
}

const AddServiceFail = status => {
    return {
        type: 'ADD_SERVICE_FAIL',
        status
    }
}

const AddServiceError = status => {
    return {
        type: 'ADD_SERVICE_ERROR',
        status
    }
}