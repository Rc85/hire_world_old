import fetch from 'axios';
import { LogError } from '../components/utils/LogError';

export const GetSession = () => {
    return dispatch => {
        dispatch(GetSessionBegin('getting session'));

        return fetch.post('/api/auth/login')
        .then(resp => {
            if (resp.data.status === 'get session success') {
                dispatch(GetSessionSuccess(resp.data.status, resp.data.user));
            } else {
                dispatch(GetSessionFail(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/auth/login'));
    }
}

const GetSessionBegin = status => {
    return {
        type: 'LOGIN_USER',
        status
    }
}

const GetSessionSuccess = (status, user) => {
    return {
        type: 'LOGIN_USER_UPDATE',
        user,
        status
    }
}

const GetSessionFail = (status, message) => {
    return {
        type: 'LOGIN_USER_ERROR',
        message,
        status
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

export const UpdateUserNotifications = () => {
    fetch.get
}

export const GetUserNotificationAndMessageCount = () => {
    return dispatch => {
        fetch.get('/api/get/user/notification-and-message-count')
        .then(resp => {
            if (resp.data.status === 'success') {
                dispatch(UpdateUserNotificationAndMessageCount(resp.data.notifications, resp.data.messages));
            }
        })
        .catch(err => LogError(err, '/api/get/user/notification-and-message-count'));
    }
}

const UpdateUserNotificationAndMessageCount = (notifications, messages) => {
    return {
        type: 'UPDATE_NOTIFICATION_AND_MESSAGE_COUNT',
        notifications,
        messages: {
            inquiries: messages.unread_inquiries,
            active: messages.unread_active,
            completed: messages.unread_completed,
            abandoned: messages.unread_abandoned
        }
    }
}