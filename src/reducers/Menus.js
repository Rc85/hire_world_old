const menuInitialState = {
    open: '',
    close: '',
    id: null
}

export const Menu = (state = menuInitialState, action) => {
    switch(action.type) {
        case 'TOGGLE_MENU': return Object.assign({}, state, {open: action.open, close: action.close, id: action.id});
        default: return state;
    }
}