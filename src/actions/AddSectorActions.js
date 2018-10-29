import fetch from 'axios';
import { Alert } from './AlertActions';

export const AddSector = (value) => {
    return dispatch => {
        dispatch(AddSectorBegin('add sector loading'));

        fetch.post('/api/admin/sector/add', {sector: value})
        .then(resp => {
            if (resp.data.status === 'add sector success') {
                dispatch(AddSectorSuccess(resp.data.status, resp.data.sectors));
            } else {
                dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => console.log(err));
    }
}

const AddSectorBegin = (status) => {
    return {
        type: 'ADD_CATEGORY_BEGIN',
        status
    }
}

const AddSectorSuccess = (status, sectors) => {
    return {
        type: 'ADD_CATEGORY_SUCCESS',
        status,
        sectors
    }
}

const AddSectorError = (status) => {
    return {
        type: 'ADD_CATEGORY_ERROR',
        status
    }
}