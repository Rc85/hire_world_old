import fetch from 'axios';

export const LogError = (error, url) => {
    fetch.post('/api/log-error', {name: error.name, message: error.message, origin: 'Client', url: url})
    .then(resp => {
        if (resp.data.status === 'error') {
            throw new Error('An error occurred while logging an error.');
        }
    })
    .catch(err => console.log(err));
}