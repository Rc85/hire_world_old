import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import fetch from 'axios'
import { GetUserNotificationAndMessageCount, UpdateUserNotifications } from '../../../actions/FetchActions';
import { connect } from 'react-redux';
import { LogError } from '../../utils/LogError';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/pro-solid-svg-icons';

class NotificationPanel extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            notifications: []
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (!prevProps.show && this.props.show) {
            this.setState({status: 'Loading'});

            fetch.post('/api/get/user/notifications', {new: true})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.props.dispatch(GetUserNotificationAndMessageCount());
                    this.setState({status: '', notifications: resp.data.notifications});
                } else if (resp.data.status === 'error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => LogError(err, '/api/user/get/notifications'));
        }

        if (prevProps.show && !this.props.show && this.state.notifications.length > 0) {
            this.props.dispatch(UpdateUserNotifications());
            this.setState({notifications: []});
        }
    }
    
    /* componentDidMount() {
        fetch.post('/api/get/user/notifications', {new: true})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(GetUserNotificationAndMessageCount());
                this.setState({status: '', notifications: resp.data.notifications});
            } else if (resp.data.status === 'error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => LogError(err, '/api/user/get/notifications'));
    } */
        
    render() {
        let notifications, body;
        let message = 'No new notifications';

        if (this.state.status === 'error') {
            message = this.state.statusMessage;
        } else if (this.state.status === 'Loading') {
            notifications = <div className='text-center'><FontAwesomeIcon icon={faCircleNotch} size='3x' spin /></div>;
        }
        
        if (this.state.notifications.length > 0) {
            notifications = this.state.notifications.map((n, i) => {
                let notification_icon;

                if (n.notification_type === 'Update') {
                    notification_icon = <span className='mini-badge mini-badge-info'>{n.notification_type}</span>;
                } else if (n.notification_type === 'Warning') {
                    notification_icon = <span className='mini-badge mini-badge-warning'>{n.notification_type}</span>;
                } else if (n.notification_type === 'Severe') {
                    notification_icon = <span className='mini-badge mini-badge-danger'>{n.notification_type}</span>;
                }

                return <div key={n.notification_id} className={`${i !== this.state.notifications.length - 1 ? 'mb-3' : ''}`}>
                    <div className='mb-1' dangerouslySetInnerHTML={{__html: n.notification_message}}></div>

                    <div className='d-flex-between-center'>
                        {notification_icon}
                        <small>{moment(n.notification_date).format('MMM DD YYYY h:mm:ss A')}</small>
                    </div>

                    {i !== this.state.notifications.length - 1 ? <hr /> : ''}
                </div>
            });
        } else if (this.state.notifications.length === 0) {
            notifications = <div className='text-center keep-format'><small><strong>{message}</strong></small></div>
        }

        return (
            <div id='notification-panel' className={this.props.show ? 'show' : ''} onClick={(e) => e.stopPropagation()}>
                {notifications}
            </div>
        );
    }
}

NotificationPanel.propTypes = {
    close: PropTypes.func,
    user: PropTypes.object
};

export default withRouter(connect()(NotificationPanel));