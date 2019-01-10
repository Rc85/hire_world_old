let configInitialState = {
    isMobile: false,
    isTyping: false
}

export const Config = (state = configInitialState, action) => {
    switch(action.type) {
        case 'SET_IS_MOBILE': return Object.assign({}, state, {isMobile: action.value});
        case 'SET_IS_TYPING': return Object.assign({}, state, {isTyping: action.value});
        default: return state;
    }
}