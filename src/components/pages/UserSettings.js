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
import BusinessHoursSettings from '../includes/page/BusinessHoursSettings';
import { LogError } from '../utils/LogError';

class UserSettings extends Component {
    saveSetting(name) {
        let props = Object.assign({}, this.props.user.user);
        props[name] = !this.props.user.user[name];

       fetch.post(`/api/user/settings/change`, props)
        .then(resp => {
            console.log(resp)
            if (resp.data.status === 'success') {
                this.props.dispatch(UpdateUser(resp.data.user));

                if (resp.data.user.hide_email && !resp.data.user.allow_messaging && resp.data.user.hide_email) {
                    this.props.dispatch(ShowWarning(`You've hidden and disabled all forms of contact`));
                }
            } else {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/user/settings/change'));
    }

    render() {
        return(
            <section id='user-settings' className='blue-panel shallow three-rounded'>
                <ProfileSettings user={this.props.user} />

                <hr/>

                <div className='d-flex-between-start mb-3'>
                    <div className='settings-col'>
                        <PasswordSettings />

                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='hideEmail'>Hide Email:</label>

                            <SlideToggle status={this.props.user.user ? this.props.user.user.hide_email : false} id='hideEmail' onClick={() => this.saveSetting('hide_email')} />
                        </div>

                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='displayFullName'>Display Full Name:</label>

                            <SlideToggle status={this.props.user.user ? this.props.user.user.display_fullname : false} id='displayFullName' onClick={() => this.saveSetting('display_fullname')} />
                        </div>

                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='emailNotifications'>Email Notifications:</label>

                            <SlideToggle status={this.props.user.user ? this.props.user.user.email_notifications : false} id='emailNotifications' onClick={() => this.saveSetting('email_notifications')} />
                        </div>

                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='allowMessaging'>Allow Messaging:</label>

                            <SlideToggle status={this.props.user.user ? this.props.user.user.allow_messaging : false} id='allowMessaging' onClick={() => this.saveSetting('allow_messaging')} />
                        </div>

                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='hideBusinessHours'>Hide Business Hours:</label>

                            <SlideToggle status={this.props.user.user ? this.props.user.user.hide_business_hours : false} id='hideBusinessHours' onClick={() => this.saveSetting('hide_business_hours')} />
                        </div>

                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='hidePhone'>Hide Phone Number:</label>

                            <SlideToggle status={this.props.user.user ? this.props.user.user.hide_phone : false} id='hidePhone' onClick={() => this.saveSetting('hide_phone')} />
                        </div>
                    </div>

                    <div className='settings-col'>
                        <EmailSettings />

                        <BusinessHoursSettings />
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