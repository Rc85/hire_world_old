const sectorsInitialState = {
    status: '',
    sectors: []
}

export const Sectors = (state = sectorsInitialState, action) => {
    switch(action.type) {
        case 'UPDATE_SECTORS':
            return Object.assign({}, state, {status: action.status, sectors: action.sectors});
        case 'UPDATE_SECTORS_ERROR':
            return Object.assign({}, state, {status: action.status});
        default: return state;
    }
}