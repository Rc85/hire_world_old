const uploadProfilePicInitialState = {
    status: null
}

export const Status = (state = uploadProfilePicInitialState, action) => {
    switch(action.type) {
        case 'FETCH_BEGIN':
        case 'FETCH_FAIL':
        case 'FETCH_ERROR':
        case 'FETCH_SUCCESS':
            return Object.assign(...state, {status: action.status});
        default: return state;
    }
}