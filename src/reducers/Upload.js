const uploadProfilePicInitialState = {
    status: null
}

export const Upload = (state = uploadProfilePicInitialState, action) => {
    switch(action.type) {
        case 'UPLOAD_BEGIN':
        case 'UPLOAD_FAIL':
        case 'UPLOAD_ERROR':
        case 'UPLOAD_SUCCESS':
            return Object.assign(...state, {status: action.status});
        default: return state;
    }
}