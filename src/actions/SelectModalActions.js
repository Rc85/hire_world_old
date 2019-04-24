export const ShowSelectionModal = (text, selections, data) => {
    return {
        type: 'SHOW_SELECTION_MODAL',
        text,
        selections,
        data
    }
}

export const ResetSelection = () => {
    return {
        type: 'RESET_SELECTION'
    }
}

export const SubmitSelection = (selected, specified) => {
    return {
        type: 'SUBMIT_SELECTION',
        selected,
        specified,
        confirm: true
    }
}

export const ResetSelectionConfirm = () => {
    return {
        type: 'RESET_SELECTION_CONFIRM'
    }
}