export const ShowWarning = message => {
    return {
        type: 'SHOW_WARNING',
        message
    }
}

export const CloseWarning = () => {
    return {
        type: 'CLOSE_WARNING'
    }
}