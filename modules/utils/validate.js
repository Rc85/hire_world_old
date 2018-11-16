module.exports = {
    usernameCheck: /^[a-zA-Z0-9_-]{5,15}$/,
    passwordCheck: /^.{6,20}$/,
    emailCheck: /^[a-zA-Z0-9_\-]+(\.{1}[a-zA-Z0-9_\-]*){0,2}@{1}[a-zA-Z0-9_\-]+\.([a-zA-Z0-9_\-]*\.{1}){0,2}[a-zA-Z0-9_\-]{2,}$/,
    nameCheck: /^[a-zA-Z]{1,15}\.?$/,
    blankCheck: /^\s*$/,
    titleCheck: /^[a-zA-Z0-9!@#$%^&*()_+-='";:{}[\].,<>\/?\\~`\s]*$/,
    priceCheck: /^[0-9]*(.){1}[0-9]{2}$/
}