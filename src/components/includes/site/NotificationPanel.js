import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import fetch from 'axios'
import { GetUserNotificationAndMessageCount } from '../../../actions/FetchActions';
import { Alert } from '../../../actions/AlertActions';
import { connect } from 'react-redux';
import { LogError } from '../../utils/LogError';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

class NotificationPanel extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            notifications: []
        }
    }
    
    componentDidMount() {
        /* document.body.addEventListener('click', this.closeNotification = (e) => {
            function composedPath (el) {
                var path = [];
            
                while (el) {
                    path.push(el);
            
                    if (el.tagName === 'HTML') {
                        path.push(document);
                        path.push(window);
            
                        return path;
                   }
            
                   el = el.parentElement;
                }
            }

            if (!composedPath(e.target).find(obj => obj.id === 'notification-panel')) {
                this.props.close();
            }
        }); */

        fetch.post('/api/get/user/notifications', {new: true})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(GetUserNotificationAndMessageCount());
                this.setState({status: '', notifications: resp.data.notifications});
            } else if (resp.data.status === 'error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => LogError(err, '/api/user/get/notifications'))
    }
        
    render() {
        let notifications;
        let message = 'No new notifications';

        if (this.state.status === 'error') {
            message = this.state.statusMessage;
        }
        
        if (this.state.notifications.length > 0) {
            notifications = this.state.notifications.map((n, i) => {
                let notification_icon;

                if (n.notification_type === 'Update') {
                    notification_icon = <FontAwesomeIcon icon={faInfoCircle} className='text-info' />;
                } else if (n.notification_type === 'Warning') {
                    notification_icon = <FontAwesomeIcon icon={faExclamationCircle} className='text-warning' />;
                } else if (n.notification_type === 'Severe') {
                    notification_icon = <FontAwesomeIcon icon={faExclamationTriangle} className='text-danger' />;
                }

                return <div key={i} className={`${i !== this.state.notifications.length - 1 ? 'mb-3' : ''} keep-format`}>
                    <div className='d-flex'>
                        <div className='mr-2'>{notification_icon}</div>
                        <span>{n.notification_message}</span>
                    </div>

                    <div className='text-right'><small>{moment(n.notification_date).format('MMM DD YYYY h:mm:ss A')}</small></div>

                    {i !== this.state.notifications.length - 1 ? <hr /> : ''}
                </div>
            });
        } else if (this.state.notifications.length === 0) {
            notifications = <div className='text-center keep-format'><small><strong>{message}</strong></small></div>
        }

        return (
            <div id='notification-panel-container' className={this.props.show ? 'show' : ''}>
                <div id='notification-panel'>
                    {notifications}
                </div>
            </div>
        );
    }
}

NotificationPanel.propTypes = {
    close: PropTypes.func
};

export default connect()(NotificationPanel);