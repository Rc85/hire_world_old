let configInitialState = {
    IsMobile: false,
    IsTyping: false,
    LoggingIn: false
}

export const Config = (state = configInitialState, action) => {
    switch(action.type) {
        case 'SET_IS_MOBILE': return Object.assign({}, state, {IsMobile: action.value});
        case 'SET_IS_TYPING': return Object.assign({}, state, {IsTyping: action.value});
        case 'SET_LOGGING_IN': return Object.assign({}, state, {LoggingIn: action.value});
        default: return state;
    }
}