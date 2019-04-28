import fetch from 'axios';
import { LogError } from '../components/utils/LogError';
import { Alert } from './AlertActions';
import { LogoutUser, LoginBegin } from './LoginActions';

export const GetSession = () => {
    return dispatch => {
        dispatch(LoginBegin('login begin'));

        return fetch.post('/api/auth/login')
        .then(resp => {
            console.log(resp)
            if (resp.data.status === 'success') {
                dispatch(GetSessionSuccess(resp.data.status, resp.data.user));
            } else if (resp.data.status === 'error') {
                dispatch(GetSessionFail(resp.data.status, resp.data.statusMessage));
            } else if (resp.data.status === 'suspended' || resp.data.status === 'banned') {
                dispatch(LogoutUser());
                if (resp.data.status === 'suspended') {
                    dispatch(Alert('error', `Your account has been temporarily banned`));
                } else if (resp.data.status === 'banned') {
                    dispatch(Alert('error', `Your account has been permanently banned`));
                }
            }
        })
        .catch(err => LogError(err, '/api/auth/login'));
    }
}

const GetSessionSuccess = (status, user) => {
    return {
        type: 'LOGIN_USER_UPDATE',
        user,
        status,
        statusMessage: ''
    }
}

const GetSessionFail = (status, message) => {
    return {
        type: 'LOGIN_USER_ERROR',
        message,
        status,
        statusMessage: '',
        user: null
    }
}

export const GetSectors = () => {
    return dispatch => {
        fetch.get('/api/get/sectors')
        .then(resp => {
            if (resp.data.status === 'get sectors success') {
                dispatch(UpdateSectors(resp.data.status, resp.data.sectors));
            } else {
                dispatch(UpdateSectorsError(resp.data.status));
            }
        })
        .catch(err => LogError(err, '/api/get/sectors'));
    }
}

const UpdateSectors = (status, sectors) => {
    return {
        type: 'UPDATE_SECTORS',
        sectors,
        status
    }
}

const UpdateSectorsError = (status) => {
    return {
        type: 'UPDATE_SECTORS_ERROR',
        status
    }
}

export const GetUserNotificationAndMessageCount = () => {
    return dispatch => {
        fetch.get('/api/get/user/notification-message-job-count')
        .then(resp => {
            if (resp.data.status === 'success') {
                dispatch(UpdateUserNotificationAndMessageCount(resp.data.notifications, resp.data.messages, resp.data.proposalCount, resp.data.jobMessageCount));
            }
        })
        .catch(err => LogError(err, '/api/get/user/notification-message-job-count'));
    }
}

const UpdateUserNotificationAndMessageCount = (notifications, messages, proposals, job_messages) => {
    return {
        type: 'UPDATE_NOTIFICATION_AND_MESSAGE_COUNT',
        notifications,
        messages: messages,
        proposals: proposals,
        job_messages: job_messages
    }
}

export const UpdateUserNotifications = () => {
    return dispatch => {
        fetch.post('/api/user/notifications/read')
        .then(resp => {
            if (resp.data.status === 'success') {
                dispatch(UpdateUserNotificationsToRead());
            } else {
                dispatch(Alert('error', 'Failed to update notifications count'));
            }
        })
        .catch(err => LogError(err, '/api/user/notifications/read'));
    }
}

const UpdateUserNotificationsToRead = () => {
    return {
        type: 'UPDATE_NOTIFICATIONS',
        notifications: '0'
    }
}