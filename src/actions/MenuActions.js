export const ToggleMenu = (open, close, id) => {
    return {
        type: 'TOGGLE_MENU',
        open: open,
        close: close,
        id: id
    }
}