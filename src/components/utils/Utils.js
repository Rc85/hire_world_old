
import fetch from 'axios';

export const unsaveListing = (id, callback) => {
    fetch.post('/api/saved_listings/unsave', {listings: [id]})
    .then(resp => {
        if (resp.data.status === 'success') {
            fetch.post('/api/get/saved_listings')
            .then(resp => {
                callback(resp);
            })
            .catch(err => console.log(err));
        }
    })
    .catch(err => console.log(err));
}