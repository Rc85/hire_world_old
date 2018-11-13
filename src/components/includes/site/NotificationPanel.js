import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import fetch from 'axios'
import { UpdateUserNotifications } from '../../../actions/FetchActions';
import Alert from '../../utils/Alert';
import { connect } from 'react-redux';

class NotificationPanel extends Component {
    componentDidMount() {
        document.body.addEventListener('click', this.closeNotification = (e) => {
            if (!e.path.find(obj => obj.id === 'notification-icon')) {
                this.props.close();
            }
        });
    }

    componentWillUnmount() {
        document.body.removeEventListener('click', this.closeNotification);

        fetch.post('/api/user/notifications/viewed')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(UpdateUserNotifications([]));
            } else if (resp.data.status === 'error') {
                this.props.dispatch(Alert('error', 'Failed to update notifications'));
            }
        })
        .catch(err => console.log(err));
    }
        
    render() {
        let notifications = this.props.items.map((n, i) => {
            return <div key={i} className={i !== this.props.items.length - 1 ? 'mb-3' : ''}>
                <div>{n.notification_message}</div>
                <div className='text-right'><small>{moment(n.notification_date).format('MMM DD YYYY - h:mm:ss')}</small></div>

                {i !== this.props.items.length - 1 ? <hr /> : ''}
            </div>
        });

        return (
            <div id='notification-panel'>
                {notifications}
            </div>
        );
    }
}

NotificationPanel.propTypes = {
    items: PropTypes.array
};

export default connect()(NotificationPanel);