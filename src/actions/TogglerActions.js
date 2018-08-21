/* export const ToggleTabs = (type, tab) => {
    return {
        type: type,
        tab: tab
    }
} */

export const ToggleMenu = (type, menu, status) => {
    return {
        type: type,
        menu,
        status
    }
}

export const CloseMenus = () => {
    return {
        type: 'CLOSE_MENUS',
        menu: 'all-menus',
        status: false
    }
}