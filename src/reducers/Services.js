const servicesInitialState = {
    services: null,
    status: null
}

export const Services = (state = servicesInitialState, action) => {
    switch(action.type) {
        case 'ADD_SERVICE_BEGIN':
        case 'ADD_SERVICE_FAIL':
        case 'ADD_SERVICE_ERROR':
        case 'UPDATE_SERVICES_ERROR':
        return Object.assign(...state, {status: action.status});
        case 'ADD_SERVICE_SUCCESS':
        case 'DELETE_SERVICE_BEGIN':
        case 'DELETE_SERVICE_FAIL':
        case 'DELETE_SERVICE_ERROR':
        case 'DELETE_SERVICE_SUCCESS':
        case 'TOGGLE_SERVICE_BEGIN':
        case 'TOGGLE_SERVICE_SUCCESS':
        case 'TOGGLE_SERVICE_FAIL':
        case 'TOGGLE_SERVICE_ERROR':
        case 'EDIT_SERVICE_BEGIN':
        case 'EDIT_SERVICE_SUCCESS':
        case 'EDIT_SERVICE_FAIL':
        case 'EDIT_SERVICE_ERROR':
        case 'UPDATE_SERVICES':
            return Object.assign(...state, {services: action.services, status: action.status});
        default:
            return state;
    }
}