const toggleMenuInitialState = {
    main_menu: false
}

export const ToggleMenu = (state = toggleMenuInitialState, action) => {
    switch(action.type) {
        case 'TOGGLE_MAIN_MENU': return Object.assign(...state, {main_menu: action.state});
        default: return state;
    }
}