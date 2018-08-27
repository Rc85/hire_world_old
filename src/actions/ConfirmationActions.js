export const ShowConfirmation = (message, note, data) => {

    return {
        type: 'SHOW_CONFIRMATION',
        status: true,
        message,
        note,
        data
    }
}

export const HideConfirmation = (option, data) => {
    return {
        type: 'HIDE_CONFIRMATION',
        status: false,
        option,
        data
    }
}

export const ResetConfirmation = () => {
    return {
        type: 'RESET_CONFIRMATION',
        status: false,
        message: null,
        option: null
    }
}