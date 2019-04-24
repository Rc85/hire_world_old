const initialState = {
    text: '',
    selections: [],
    data: {},
    selected: '',
    specified: '',
    confirm: false
}

export const Selection = (state = initialState, action) => {
    switch(action.type) {
        case 'SHOW_SELECTION_MODAL': return Object.assign({}, state, {text: action.text, selections: action.selections, data: action.data});
        case 'RESET_SELECTION': return Object.assign({}, state, {text: '', selections: [], data: {}, confirm: false, selected: '', specified: ''});
        case 'SUBMIT_SELECTION': return Object.assign({}, state, {confirm: action.confirm, selected: action.selected, specified: action.specified})
        case 'RESET_SELECTION_CONFIRM': return Object.assign({}, state, {confirm: false});
        default: return state;
    }
}