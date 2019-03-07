import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
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
import Loading from '../utils/Loading';
import TitledContainer from '../utils/TitledContainer';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../utils/Tooltip';

class AccountSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: ''
        }
    }
    
    saveSetting(name) {
        this.setState({status: name});

        let setting = Object.assign({}, this.props.user.user);
        setting[name] = !setting[name];

       fetch.post(`/api/user/settings/change`, setting)
        .then(resp => {
            this.setState({status: ''});

            if (resp.data.status === 'success') {
                this.props.dispatch(UpdateUser(setting));

                if (setting.hide_email && !setting.allow_messaging) {
                    this.props.dispatch(ShowWarning(`Consider either having email displayed or messaging allowed so users can contact you.`));
                }
            } else {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            LogError(err, '/api/user/settings/change');
            this.setState({status: ''});
        });
    }

    render() { 
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        }

        if (this.props.user.user) {
            return(
                <section id='user-settings' className='main-panel'>
                    <TitledContainer title='Account Settings' bgColor='orange' icon={<FontAwesomeIcon icon={faUserCircle} />} shadow>
                        <ProfileSettings user={this.props.user} />
        
                        <hr/>
        
                        <div className='setting-field-container start mb-3'>
                            <div className='settings-col'><PasswordSettings /></div>
                            <div className='settings-col'><EmailSettings user={this.props.user.user} /></div>
                        </div>
        
                        <div className='setting-field-container mb-3'>
                            <div className='settings-col'>
                                <div className='setting-col-field mb-3'>
                                    <label htmlFor='hideEmail'>Hide email:</label>
        
                                    <div className='d-flex'>
                                        {this.state.status === 'hide_email' ? <div className='p-relative mr-2'><Loading /></div> : ''}
                                        <SlideToggle status={this.props.user.user && this.props.user.user.hide_email ? this.props.user.user.hide_email : false} id='hideEmail' onClick={() => this.saveSetting('hide_email')} />
                                    </div>
                                </div>
        
                                <div className='setting-col-field mb-3'>
                                    <label htmlFor='displayFullName'>Show full name:</label>
        
                                    <div className='d-flex'>
                                        {this.state.status === 'display_fullname' ? <div className='p-relative mr-2'><Loading /></div> : ''}
                                        <SlideToggle status={this.props.user.user && this.props.user.user.display_fullname ? this.props.user.user.display_fullname : false} id='displayFullName' onClick={() => this.saveSetting('display_fullname')} />
                                    </div>
                                </div>
                            </div>
        
                            <div className='settings-col'>
                                <div className='setting-col-field mb-3'>
                                    <Tooltip text='You will receive email when you have new messages and when changes are made to your account.' placement='top'><label htmlFor='emailNotifications'>Email notifications: <FontAwesomeIcon icon={faQuestionCircle} id='email-notification-tips'  className='tooltip-icon' /></label></Tooltip>
        
                                    <div className='d-flex'>
                                        {this.state.status === 'email_notifications' ? <div className='p-relative mr-2'><Loading /></div> : ''}
                                        <SlideToggle status={this.props.user.user && this.props.user.user.email_notifications ? this.props.user.user.email_notifications : false} id='emailNotifications' onClick={() => this.saveSetting('email_notifications')} />
                                    </div>
                                </div>
        
                                <div className='setting-col-field mb-3'>
                                    <label htmlFor='allowMessaging'>Enable Messaging:</label>
        
                                    <div className='d-flex'>
                                        {this.state.status === 'allow_messaging' ? <div className='p-relative mr-2'><Loading /></div> : ''}
                                        <SlideToggle status={this.props.user.user && this.props.user.user.allow_messaging ? this.props.user.user.allow_messaging : false} id='allowMessaging' onClick={() => this.saveSetting('allow_messaging')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TitledContainer>
                </section>
            )
        }
        
        return <Loading size='7x' color='black' />;
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