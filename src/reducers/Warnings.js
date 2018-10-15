const warningInitialState = {
    message: ''
}

export const Warning = (state = warningInitialState, action) => {
    switch(action.type) {
        case 'SHOW_WARNING': return Object.assign({}, state, {message: action.message});
        case 'CLOSE_WARNING': return Object.assign({}, state, {message: ''});
        default: return state;
    }
}