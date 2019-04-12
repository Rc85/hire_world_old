const promptInitialState = {
    text: '',
    data: {},
    input: '',
    value: ''
}

export const Prompt = (state = promptInitialState, action) => {
    switch(action.type) {
        case 'OPEN_PROMPT': return Object.assign({}, state, {text: action.text, data: action.data, value: action.value});
        case 'SUBMIT_PROMPT': return Object.assign({}, state, {text: '', input: action.input, data: action.data});
        case 'PROMPT_RESET': return Object.assign({}, state, promptInitialState);
        default:
            return state;
    }
}