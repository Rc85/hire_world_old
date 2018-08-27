const loginInitialState = {
    status: '',
    user: null
}

export const Login = (state = loginInitialState, action) => {
    switch(action.type) {
        case 'LOGIN_USER_BEGIN':
        case 'LOGIN_USER_FAIL':
        case 'LOGIN_USER_ERROR':
            return Object.assign(...state, {status: action.status});
        case 'LOGIN_USER_SUCCESS':
        case 'EDIT_USER_SUCCESS':
        case 'GET_SESSION_SUCCESS':
        case 'GET_SESSION_FAIL':
        case 'EDIT_USER_BEGIN':
        case 'EDIT_USER_FAIL':
        case 'EDIT_USER_ERROR':
        case 'SAVE_LOCATIONS_SUCCESS':
        case 'SAVE_LOCATIONS_BEGIN':
        case 'SAVE_LOCATIONS_FAIL':
        case 'SAVE_LOCATIONS_ERROR':
        case 'SAVE_PROFILE_SUCCESS':
        case 'SAVE_PROFILE_BEGIN':
        case 'SAVE_PROFILE_FAIL':
        case 'SAVE_PROFILE_ERROR':
        case 'SAVE_EMAIL_SUCCESS':
        case 'SAVE_EMAIL_BEGIN':
        case 'SAVE_EMAIL_FAIL':
        case 'SAVE_EMAIL_ERROR':
            return Object.assign(...state, {status: action.status, user: action.user});
        case 'RESET_STATUS': return Object.assign(...state, {status: '', user: action.user});
        case 'LOGOUT_USER':
        default: return state;
    }
}

const registerInitialState = {
    status: null
}

export const Register = (state = registerInitialState, action) => {
    switch(action.type) {
        case 'REGISTER_USER_BEGIN':
        case 'REGISTER_USER_FAILED':
            return Object.assign(...state, {status: action.status});
        case 'REGISTER_USER_SUCCESS': return Object.assign(...state, {status: action.status});
        case 'REGISTER_USER_ERROR': return Object.assign(...state, {status: action.status});
        default: return state;
    }
}