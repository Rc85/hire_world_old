
import fetch from 'axios';

export const GetMessage = (id, stage, offset, callback) => {
    fetch.post('/api/get/message', {id: id, offset: offset, stage: stage})
    .then(resp => {
        callback(resp.data);
    })
    .catch(err => console.log(err));
}

export const SendMessage = (data, callback) => {
    fetch.post('/api/message/reply', data)
    .then(resp => {
        callback(resp.data);
    })
    .catch(err => console.log(err));
}