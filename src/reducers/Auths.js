const loginInitialState = {
    status: '',
    statusMessage: '',
    user: null,
    notifications: 0,
    messages: 0,
    job_messages: {
        opened_job_message_count: 0,
        active_job_message_count: 0
    }
}

export const Login = (state = loginInitialState, action) => {
    switch(action.type) {
        case 'LOGIN_USER': return Object.assign({}, state, {status: action.status});
        case 'LOGIN_USER_ERROR': return Object.assign({}, state, {status: action.status, statusMessage: action.statusMessage, user: action.user});
        case 'LOGIN_USER_UPDATE': return Object.assign({}, state, {status: action.status, user: action.user, statusMessage: action.statusMessage});
        case 'UPDATE_NOTIFICATION_AND_MESSAGE_COUNT': return Object.assign({}, state, {notifications: action.notifications, messages: action.messages, job_messages: action.job_messages});
        case 'USER_UPDATE': return Object.assign({}, state, {user: action.user});
        case 'UPDATE_NOTIFICATIONS': return Object.assign({}, state, {notifications: action.notifications});
        case 'LOGOUT_USER': return Object.assign({}, state, {status: action.status, statusMessage: '', user: null, notifications: 0, messages: 0});
        default:
            return state;
    }
}