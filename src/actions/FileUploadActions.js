import fetch from 'axios';
import { GetSession } from './FetchActions';

export const UploadProfilePic = (file) => {
    return dispatch => {
        dispatch(UploadBegin('upload loading'))

        fetch.post('/api/user/profile-pic/upload', file)
        .then(resp => {
            if (resp.data.status === 'upload success') {
                dispatch(UploadSuccess(resp.data.status));
                dispatch(GetSession());
            } else if (resp.data.status === 'upload fail') {
                dispatch(UploadFail(resp.data.status));
            } else if (resp.data.status === 'upload error') {
                dispatch(UploadError(resp.data.status));
            }
        })
        .catch(err => console.log(err));
    }
}

export const DeleteProfilePic = () => {
    console.log('and here')
    return dispatch => {
        dispatch(UploadBegin('delete loading'));

        fetch.post('/api/user/profile-pic/delete')
        .then(resp => {
            console.log(resp)
            if (resp.data.status === 'delete success') {
                dispatch(UploadSuccess(resp.data.status));
                dispatch(GetSession());
            } else if (resp.data.status === 'delete fail') {
                dispatch(UploadFail(resp.data.status));
            } else if (resp.data.status === 'delete error') {
                dispatch(UploadError(resp.data.status));
            }
        })
        .catch(err => console.log(err));
    }
}

const UploadBegin = (status) => {
    return {
        type: 'UPLOAD_BEGIN',
        status
    }
}

const UploadSuccess = (status) => {
    return {
        type: 'UPLOAD_SUCCESS',
        status
    }
}

const UploadFail = (status) => {
    return {
        type: 'UPLOAD_FAIL',
        status
    }
}

const UploadError = (status) => {
    return {
        type: 'UPLOAD_ERROR',
        status
    }
}