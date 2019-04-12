export const PromptOpen = (text, value, data) => {
    return {
        type: 'OPEN_PROMPT',
        data,
        value,
        text
    }
}

export const PromptSubmit = (input, data) => {
    return {
        type: 'SUBMIT_PROMPT',
        data,
        input
    }
}

export const PromptReset = () => {
    return {
        type: 'PROMPT_RESET'
    }
}