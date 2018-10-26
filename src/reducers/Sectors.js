const sectorsInitialState = {
    status: '',
    sectors: []
}

export const Sectors = (state = sectorsInitialState, action) => {
    switch(action.type) {
        case 'ADD_CATEGORY_SUCCESS':
        case 'UPDATE_SECTORS':
            return Object.assign({}, state, {status: action.status, sectors: action.sectors});
        case 'ADD_CATEGORY_BEGIN':
        case 'ADD_CATEGORY_FAIL':
        case 'ADD_CATEGORY_ERROR':
        case 'UPDATE_SECTORS_ERROR':
            return Object.assign({}, state, {status: action.status});
        default: return state;
    }
}