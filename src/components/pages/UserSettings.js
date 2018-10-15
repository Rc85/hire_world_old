import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ProfileSettings from '../includes/page/ProfileSettings';
import EmailSettings from '../includes/page/EmailSettings';
import PasswordSettings from '../includes/page/PasswordSettings';
import { UpdateUser } from '../../actions/LoginActions';
import PropTypes from 'prop-types';
import SlideToggle from '../utils/SlideToggle';
import fetch from 'axios';
import { Alert } from '../../actions/AlertActions';
import { ShowWarning } from '../../actions/WarningActions';

class UserSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            hide_email: this.props.user.user.hide_email,
            display_fullname: this.props.user.user.display_fullname,
            email_notifications: this.props.user.user.email_notifications,
            allow_messaging: this.props.user.user.allow_messaging
        }
    }
    
    componentWillUnmount() {
        this.props.dispatch(UpdateUser(this.props.user.user));
    }

    saveSetting(name) {
        let state = this.state;
        state[name] = !this.state[name];

       fetch.post(`/api/user/settings/change`, state)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState(state);

                this.props.dispatch(UpdateUser(resp.data.user));

                if (resp.data.user.hide_email && !resp.data.user.allow_messaging && !resp.data.user.user_phone) {
                    this.props.dispatch(ShowWarning(`You've hidden and disabled all forms of contact`));
                }
            } else {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        });
    }

    render() {
        return(
            <section id='user-settings' className='blue-panel shallow three-rounded'>
                <ProfileSettings user={this.props.user} />

                <hr/>

                <div className='d-flex-between-start mb-3'>
                    <div className='settings-col'>
                        <PasswordSettings />
    
                        <EmailSettings user={this.props.user} />
                    </div>

                    <div className='settings-col'>
                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='hideEmail'>Hide Email:</label>

                            <SlideToggle status={this.props.user.user.hide_email} id='hideEmail' onClick={() => this.saveSetting('hide_email')} />
                        </div>

                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='displayFullName'>Display Full Name:</label>

                            <SlideToggle status={this.props.user.user.display_fullname} id='displayFullName' onClick={() => this.saveSetting('display_fullname')} />
                        </div>

                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='emailNotifications'>Email Notifications:</label>

                            <SlideToggle status={this.props.user.user.email_notifications} id='emailNotifications' onClick={() => this.saveSetting('email_notifications')} />
                        </div>

                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='allowMessaging'>Allow Messaging:</label>

                            <SlideToggle status={this.props.user.user.allow_messaging} id='allowMessaging' onClick={() => this.saveSetting('allow_messaging')} />
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

UserSettings.propTypes = {
    user: PropTypes.object.isRequired
}

const mapStateToProps = state => {
    return {
        sectors: state.Sectors.sectors
    }
}

export default withRouter(connect(mapStateToProps)(UserSettings));