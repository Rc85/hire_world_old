export const isMobile = value => {
    return {
        type: 'SET_IS_MOBILE',
        value: value
    }
}

export const isTyping = value => {
    return {
        type: 'SET_IS_TYPING',
        value: value
    }
}