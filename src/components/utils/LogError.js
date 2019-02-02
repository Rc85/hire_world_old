import fetch from 'axios';

export const LogError = (error, url) => {
    fetch.post('/api/log-error', {stack: error.stack, url})
    .then(() => {
        console.log(error);
    })
    .catch(err => console.log(err));
}