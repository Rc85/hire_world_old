const loginInitialState = {
    status: '',
    statusMessage: '',
    user: null,
    notifications: 0,
    messages: {
        inquiries: 0,
        active: 0,
        completed: 0,
        abandoned: 0
    }
}

export const Login = (state = loginInitialState, action) => {
    switch(action.type) {
        case 'LOGIN_USER': return Object.assign({}, state, {status: action.status});
        case 'LOGIN_USER_ERROR': return Object.assign({}, state, {status: action.status, statusMessage: action.message});
        case 'LOGIN_USER_UPDATE': return Object.assign({}, state, {status: action.status, user: action.user, statusMessage: action.statusMessage});
        case 'UPDATE_NOTIFICATION_AND_MESSAGE_COUNT': return Object.assign({}, state, {notifications: action.notifications, messages: {
            inquiries: action.messages.inquiries, active: action.messages.active, completed: action.messages.completed, abandoned: action.messages.abandoned
        }});
        case 'USER_UPDATE': return Object.assign({}, state, {user: action.user});
        case 'UPDATE_NOTIFICATIONS': return Object.assign({}, state, {notifications: action.notifications});
        case 'LOGOUT_USER':
        default:
            return state;
    }
}