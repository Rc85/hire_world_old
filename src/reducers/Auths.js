const loginInitialState = {
    status: '',
    statusMessage: '',
    user: null
}

export const Login = (state = loginInitialState, action) => {
    switch(action.type) {
        case 'LOGIN_USER':
            return Object.assign({}, state, {status: action.status});
        case 'LOGIN_USER_ERROR':
            return Object.assign({}, state, {status: action.status, statusMessage: action.message});
        case 'LOGIN_USER_UPDATE':
            return Object.assign({}, state, {status: action.status, user: action.user, statusMessage: action.statusMessage});
        case 'USER_UPDATE':
            return Object.assign({}, state, {user: action.user});
        case 'LOGOUT_USER':
        default: return state;
    }
}