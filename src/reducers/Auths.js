const loginInitialState = {
    status: '',
    user: null
}

export const Login = (state = loginInitialState, action) => {
    switch(action.type) {
        case 'LOGIN_USER':
            return Object.assign({}, state, {status: action.status});
        case 'LOGIN_USER_UPDATE':
            return Object.assign({}, state, {status: action.status, user: action.user});
        case 'RESET_STATUS': return Object.assign({}, state, {status: '', user: action.user});
        case 'LOGOUT_USER':
        default: return state;
    }
}