const confirmationInitialState = {
    status: false,
    message: null,
    option: null,
    note: null,
    data: null
}

export const Confirmation = (state = confirmationInitialState, action) => {
    switch(action.type) {
        case 'SHOW_CONFIRMATION': return Object.assign({}, state, {status: action.status, message: action.message, option: null, data: action.data, note: action.note});
        case 'HIDE_CONFIRMATION': return Object.assign({}, state, {status: action.status, option: action.option, data: action.data});
        case 'RESET_CONFIRMATION': return Object.assign({}, state, {status: action.status, message: action.message, option: action.option});
        default:
            return state;
    }
}