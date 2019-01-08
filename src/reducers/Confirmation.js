const confirmationInitialState = {
    status: false,
    obj: {},
    message: null,
    option: null,
    note: null,
    data: null
}

export const Confirmation = (state = confirmationInitialState, action) => {
    switch(action.type) {
        case 'SHOW_CONFIRMATION': return Object.assign({}, state, {status: action.status, message: action.message, option: null, data: action.data, note: action.note});
        case 'HIDE_CONFIRMATION': return Object.assign({}, state, {status: action.status, option: action.option, data: action.data});
        case 'CHECKOUT_CONFIRMATION': return Object.assign({}, state, {status: action.status, obj: action.obj, option: action.option, data: action.data});
        case 'RESET_CONFIRMATION': return Object.assign({}, state, {status: action.status, obj: action.obj, option: action.option, message: action.message, note: action.note, data: action.data});
        default:
            return state;
    }
}