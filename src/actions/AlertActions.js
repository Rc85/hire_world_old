export const Alert = (status, message) => {
    return {
        type: 'ADD_ALERT',
        status,
        message
    }
}

export const RemoveAlert = alerts => {
    return {
        type: 'REMOVE_ALERT',
        alerts
    }
}