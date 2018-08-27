import fetch from 'axios';

export const AddSector = (value) => {
    return dispatch => {
        dispatch(AddSectorBegin('add sector loading'));

        fetch.post('/api/admin/add-sector', {sector: value})
        .then(resp => {
            if (resp.data.status === 'add sector success') {
                dispatch(AddSectorSuccess(resp.data.status, resp.data.sectors));
            } else {
                dispatch(AddSectorError(resp.data.status));
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