const loadingInitialState = {
    show: false,
    text: ''
}

export const Loading = (state = loadingInitialState, action) => {
    switch(action.type) {
        case 'SHOW_LOADING': return Object.assign({}, state, {show: action.show, text: action.text});
        case 'HIDE_LOADING': return Object.assign({}, state, {show: action.show});
        default: return state;
    }
}