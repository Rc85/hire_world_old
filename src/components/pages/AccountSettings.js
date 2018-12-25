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
import { LogError } from '../utils/LogError';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { UncontrolledTooltip } from 'reactstrap';
import Loading from '../utils/Loading';

class AccountSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: ''
        }
    }
    
    saveSetting(name) {
        this.setState({status: 'Loading'});

        let setting = Object.assign({}, this.props.user.user);
        setting[name] = !setting[name];

       fetch.post(`/api/user/settings/change`, setting)
        .then(resp => {
            this.setState({status: ''});

            if (resp.data.status === 'success') {
                this.props.dispatch(UpdateUser(resp.data.user));

                if (resp.data.user.hide_email && !resp.data.user.allow_messaging) {
                    this.props.dispatch(ShowWarning(`Consider either have email displayed or allow messaging so users can contact you.`));
                }
            } else {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/user/settings/change'));
    }

    render() {
        let status;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        return(
            <section id='user-settings' className='blue-panel shallow three-rounded'>
                {status}

                <ProfileSettings user={this.props.user} />

                <hr/>

                <div className='d-flex-between-start mb-3'>
                    <div className='w-45'><PasswordSettings /></div>
                    <div className='w-45'><EmailSettings /></div>
                </div>

                <div className='d-flex-between-start mb-3'>
                    <div className='settings-col'>
                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='hideEmail'>Hide email:</label>

                            <SlideToggle status={this.props.user.user ? this.props.user.user.hide_email : false} id='hideEmail' onClick={() => this.saveSetting('hide_email')} />
                        </div>

                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='displayFullName'>Display full name instead of username in your listing:</label>

                            <SlideToggle status={this.props.user.user ? this.props.user.user.display_fullname : false} id='displayFullName' onClick={() => this.saveSetting('display_fullname')} />
                        </div>
                    </div>

                    <div className='settings-col'>
                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='emailNotifications'>Email notifications: <FontAwesomeIcon icon={faQuestionCircle} id='email-notification-tips' /><UncontrolledTooltip placement='top' target='email-notification-tips'>You will receive email when you have new messages and when there are changes to your account.</UncontrolledTooltip></label>

                            <SlideToggle status={this.props.user.user ? this.props.user.user.email_notifications : false} id='emailNotifications' onClick={() => this.saveSetting('email_notifications')} />
                        </div>

                        <div className='d-flex-between-center mb-3'>
                            <label htmlFor='allowMessaging'>Allow messaging:</label>

                            <SlideToggle status={this.props.user.user ? this.props.user.user.allow_messaging : false} id='allowMessaging' onClick={() => this.saveSetting('allow_messaging')} />
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

AccountSettings.propTypes = {
    user: PropTypes.object.isRequired
}

const mapStateToProps = state => {
    return {
        sectors: state.Sectors.sectors
    }
}

export default withRouter(connect(mapStateToProps)(AccountSettings));