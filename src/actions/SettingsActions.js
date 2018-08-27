import fetch from 'axios';

export const SaveLocations = (data, user) => {
    return dispatch => {
        dispatch(SaveLocationsBegin('save locations loading', user));

        fetch.post('/api/user/settings/locations/save', data)
        .then(resp => {
            if (resp.data.status === 'save locations success') {
                dispatch(SaveLocationsSuccess(resp.data.status, resp.data.user));
            } else if (resp.data.status === 'save locations fail') {
                dispatch(SaveLocationsFail(resp.data.status, user));
            } else if (resp.data.status === 'save locations error') {
                dispatch(SaveLocationsError(resp.data.status, user));
            }
        })
        .catch(err => console.log(err));
    }
}

const SaveLocationsBegin = (status, user) => {
    return {
        type: 'SAVE_LOCATIONS_BEGIN',
        status,
        user
    }
}

const SaveLocationsFail = (status, user) => {
    return {
        type: 'SAVE_LOCATIONS_FAIL',
        status,
        user
    }
}

const SaveLocationsSuccess = (status, user) => {
    return {
        type: 'SAVE_LOCATIONS_SUCCESS',
        status,
        user
    }
}

const SaveLocationsError = (status, user) => {
    return {
        type: 'SAVE_LOCATIONS_ERROR',
        status,
        user
    }
}

export const SaveProfile = (data, user) => {
    return dispatch => {
        dispatch(SaveProfileBegin('save profile loading', user));

        fetch.post('/api/user/settings/profile/save', data)
        .then(resp => {
            if (resp.data.status === 'save profile success') {
                dispatch(SaveProfileSuccess(resp.data.status, resp.data.user));
            } else if (resp.data.status === 'save profile fail') {
                dispatch(SaveProfileFail(resp.data.status, user));
            } else if (resp.data.status === 'save profile error') {
                dispatch(SaveProfileError(resp.data.status, user));
            }
        })
        .catch(err => console.log(err));
    }
}

const SaveProfileBegin = (status, user) => {
    return {
        type: 'SAVE_PROFILE_BEGIN',
        status,
        user
    }
}

const SaveProfileFail = (status, user) => {
    return {
        type: 'SAVE_PROFILE_FAIL',
        status,
        user
    }
}

const SaveProfileSuccess = (status, user) => {
    return {
        type: 'SAVE_PROFILE_SUCCESS',
        status,
        user
    }
}

const SaveProfileError = (status, user) => {
    return {
        type: 'SAVE_PROFILE_ERROR',
        status,
        user
    }
}

export const SaveEmail = (data, user) => {
    return dispatch => {
        dispatch(SaveEmailBegin('save email loading', user));

        fetch.post('/api/user/settings/email/change', data)
        .then(resp => {
            if (resp.data.status === 'save email success') {
                dispatch(SaveEmailSuccess(resp.data.status, resp.data.user));
            } else {
                dispatch(SaveEmailError(resp.data.status, user));
            }
        })
        .catch(err => console.log(err));
    }
}

const SaveEmailBegin = (status, user) => {
    return {
        type: 'SAVE_EMAIL_BEGIN',
        status,
        user
    }
}

const SaveEmailSuccess = (status, user) => {
    return {
        type: 'SAVE_EMAIL_SUCCESS',
        status,
        user
    }
}

const SaveEmailError = (status, user) => {
    return {
        type: 'SAVE_EMAIL_ERROR',
        status,
        user
    }
}