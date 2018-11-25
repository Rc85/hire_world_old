
import fetch from 'axios';
import { LogError } from './LogError';

export const unsaveListing = (id, callback) => {
    fetch.post('/api/saved_listings/unsave', {listings: [id]})
    .then(resp => {
        if (resp.data.status === 'success') {
            fetch.post('/api/get/saved_listings')
            .then(resp => {
                callback(resp);
            })
            .catch(err => LogError(err, '/api/get/saved_listings'));
        }
    })
    .catch(err => LogError(err, '/api/saved_listings/unsave'));
}