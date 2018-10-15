export const PromptOpen = (text, data) => {
    return {
        type: 'OPEN_PROMPT',
        data,
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