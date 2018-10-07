module.exports = {
    usernameCheck: /^[a-zA-Z0-9_-]{5,15}$/g,
    passwordCheck: /^.{6,20}$/g,
    emailCheck: /^[a-zA-Z0-9_\-]+(\.{1}[a-zA-Z0-9_\-]*){0,2}@{1}[a-zA-Z0-9_\-]+\.([a-zA-Z0-9_\-]*\.{1}){0,2}[a-zA-Z0-9_\-]{2,}$/g,
    nameCheck: /^[a-zA-Z]{1,15}\.?$/g,
    blankCheck: /^\s*$/g,
    titleCheck: /^[a-zA-Z0-9!@#$%^&*()_+-='";:{}[\].,<>\/?\\~`\s]*$/g
}