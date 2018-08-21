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
        case 'UPDATE_SERVICES':
            return Object.assign(...state, {services: action.services, status: action.status});
        default:
            return state;
    }
}