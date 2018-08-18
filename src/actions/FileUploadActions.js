import fetch from 'axios';
import { GetSession } from '../actions/EditUserActions';

export const UploadProfilePic = (file) => {
    return dispatch => {
        dispatch(FetchBegin())

        fetch.post('/api/upload/profile_pic', file)
        .then(resp => {
            if (resp.data.status === 'upload success') {
                dispatch(FetchSuccess(resp.data.status));
                dispatch(GetSession());
            } else if (resp.data.status === 'upload fail') {
                dispatch(FetchFail(resp.data.status));
            } else if (resp.data.status === 'upload error') {
                dispatch(FetchError(resp.data.status));
            }
        })
        .catch(err => console.log(err));
    }
}

export const DeleteProfilePic = () => {
    return dispatch => {
        dispatch(FetchBegin());

        fetch.post('/api/delete/profile_pic')
        .then(resp => {
            if (resp.data.status === 'success') {
                dispatch(FetchSuccess(resp.data.status));
                dispatch(GetSession());
            } else if (resp.data.status === 'fail') {
                dispatch(FetchFail(resp.data.status));
            } else if (resp.data.status === 'delete error') {
                dispatch(FetchError(resp.data.status));
            }

            return resp;
        })
        .catch(err => console.log(err));
    }
}

const FetchBegin = () => {
    return {
        type: 'FETCH_BEGIN',
        status: 'loading'
    }
}

const FetchSuccess = (status) => {
    return {
        type: 'FETCH_SUCCESS',
        status
    }
}

const FetchFail = (status) => {
    return {
        type: 'FETCH_FAIL',
        status
    }
}

const FetchError = (status) => {
    return {
        type: 'FETCH_ERROR',
        status
    }
}