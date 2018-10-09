const initialState = {
    alerts: []
};

export const Alert = (state = initialState, action) => {
    switch(action.type) {
        case 'ADD_ALERT': return Object.assign({}, state, {alerts: [...state.alerts, {status: action.status, message: action.message}]});
        case 'REMOVE_ALERT': return Object.assign({}, state, {alerts: [...action.alerts]});
        default: return state;
    }
}