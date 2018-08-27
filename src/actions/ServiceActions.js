import fetch from 'axios';

export const ToggleService = (id, available, services) => {
    return dispatch => {
        dispatch(ToggleServiceBegin('service status loading', services));

        fetch.post('/api/user/services/status', {id: id, available: available})
        .then(resp => {
            if (resp.data.status === 'service status success') {
                dispatch(ToggleServiceSuccess(resp.data.status, services));
            } else {
                dispatch(ToggleServiceError(resp.data.status, services));
            }
        })
        .catch(err => console.log(err));
    }
}

const ToggleServiceBegin = (status, services) => {
    return {
        type: 'TOGGLE_SERVICE_BEGIN',
        status,
        services
    }
}

const ToggleServiceSuccess = (status, services) => {
    return {
        type: 'TOGGLE_SERVICE_SUCCESS',
        status,
        services
    }
}

const ToggleServiceError = (status, services) => {
    return {
        type: 'TOGGLE_SERVICE_ERROR',
        status,
        services
    }
}

export const DeleteService = (id, services) => {
    return dispatch => {
        dispatch(DeleteServiceBegin('delete service loading', services));

        fetch.post('/api/user/services/delete', {id: id})
        .then(resp => {
            if (resp.data.status === 'delete service success') {
                dispatch(DeleteServiceSuccess(resp.data.status, resp.data.services));
            } else if (resp.data.status === 'delete service fail') {
                dispatch(DeleteServiceFail(resp.data.status, services));
            } else if (resp.data.status === 'delete service error') {
                dispatch(DeleteServiceError(resp.data.status, services));
            }
        })
        .catch(err => console.log(err));
    }
}

const DeleteServiceBegin = (status, services) => {
    return {
        type: 'DELETE_SERVICE_BEGIN',
        status,
        services
    }
}

const DeleteServiceSuccess = (status, services) => {
    return {
        type: 'DELETE_SERVICE_SUCCESS',
        status,
        services
    }
}

const DeleteServiceFail = (status, services) => {
    return {
        type: 'DELETE_SERVICE_FAIL',
        status,
        services
    }
}

const DeleteServiceError = (status, services) => {
    return {
        type: 'DELETE_SERVICE_ERROR',
        status,
        services
    }
}

export const EditService = (data, services) => {
    return dispatch => {
        dispatch(EditServiceBegin('edit service loading', services));

        fetch.post('/api/user/services/edit', data)
        .then(resp => {
            if (resp.data.status === 'edit service success') {
                dispatch(EditServiceSuccess(resp.data.status, resp.data.services));
            } else if (resp.data.status === 'edit service fail') {
                dispatch(EditServiceFail(resp.data.status, services));
            } else if (resp.data.status === 'edit service error') {
                dispatch(EditServiceError(resp.data.status, services));
            }
        })
        .catch(err => console.log(err));
    }
}

const EditServiceBegin = (status, services) => {
    return {
        type: 'EDIT_SERVICE_BEGIN',
        status,
        services
    }
}

const EditServiceSuccess = (status, services) => {
    return {
        type: 'EDIT_SERVICE_SUCCESS',
        status,
        services
    }
}

const EditServiceFail = (status, services) => {
    return {
        type: 'EDIT_SERVICE_FAIL',
        status,
        services
    }
}

const EditServiceError = (status, services) => {
    return {
        type: 'EDIT_SERVICE_ERROR',
        status,
        services
    }
}