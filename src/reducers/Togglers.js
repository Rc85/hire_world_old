const toggleMenuInitialState = {
    menu: null,
    status: false
}

export const ToggleMenu = (state = toggleMenuInitialState, action) => {
    switch(action.type) {
        case 'TOGGLE_MAIN_MENU':
        case 'TOGGLE_MENU':
        case 'CLOSE_MENUS':
            return Object.assign(...state, {menu: action.menu, status: action.status});
        default: return state;
    }
}