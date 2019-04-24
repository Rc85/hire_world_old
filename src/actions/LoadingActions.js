export const ShowLoading = text => {
    return {
        type: 'SHOW_LOADING',
        show: true,
        text
    }
}

export const HideLoading = () => {
    return {
        type: 'HIDE_LOADING',
        show: false
    }
}