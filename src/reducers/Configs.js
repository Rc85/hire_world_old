let configInitialState = {
    mobile: false,
    typing: false,
    login: false,
    loaded: false
}

export const Config = (state = configInitialState, action) => {
    switch(action.type) {
        case 'SITE_LOADED': return Object.assign({}, state, {loaded: true})
        case 'SET_IS_MOBILE': return Object.assign({}, state, {mobile: action.value});
        case 'SET_IS_TYPING': return Object.assign({}, state, {typing: action.value});
        case 'SET_LOGGING_IN': return Object.assign({}, state, {login: action.value});
        default: return state;
    }
}