const menuInitialState = {
    show: false,
    id: null
}

export const Menu = (state = menuInitialState, action) => {
    switch(action.type) {
        case 'TOGGLE_MENU': return Object.assign({}, state, {show: action.show, id: action.id});
        default: return state;
    }
}