import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import PersonalSettings from '../components/PersonalSettings';
import PasswordSettings from '../components/PasswordSettings';
import { UpdateUser, LogoutUser } from '../actions/LoginActions';
import PropTypes from 'prop-types';
import SlideToggle from '../components/utils/SlideToggle';
import fetch from 'axios';
import { Alert } from '../actions/AlertActions';
import { ShowWarning } from '../actions/WarningActions';
import { LogError } from '../components/utils/LogError';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Loading from '../components/utils/Loading';
import TitledContainer from '../components/utils/TitledContainer';
import { faUserCircle, faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
import InputWrapper from '../components/utils/InputWrapper';
import SubmitButton from '../components/utils/SubmitButton';
import { PromptOpen, PromptReset } from '../actions/PromptActions';

class AccountSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: ''
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.prompt.data) {
            if (this.props.prompt.data.action === 'disable 2fa 1' && this.props.prompt.input !== prevProps.prompt.input) {
                this.setState({password: this.props.prompt.input});
                this.props.dispatch(PromptReset());
                this.props.dispatch(PromptOpen('Enter 6 digit code:', '', {action: 'disable 2fa 2'}));
            } else if (this.props.prompt.data.action === 'disable 2fa 2' && !prevProps.prompt.input && this.props.prompt.input !== prevProps.prompt.input) {
                this.disable2fa(this.state.password, this.props.prompt.input);
                this.props.dispatch(PromptReset());
            } else if (this.props.prompt.data.action === 'close account' && !prevProps.prompt.input && this.props.prompt.input !== prevProps.prompt.input) {
                this.closeAccount(this.props.prompt.input);
                this.props.dispatch(PromptReset());
            }
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
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    configure2fa() {
        this.setState({status: 'Loading 2FA', configure2fa: true});

        fetch.post('/api/auth/get/2fa')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', imageUrl: resp.data.imageUrl});
            } else if (resp.data.status === 'error') {
                this.setState({status: '2fa error'});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
            LogError(err, '/api/auth/get/2fa');
        });
    }

    verify2fa() {
        this.setState({status: 'Verifying 2FA'});

        fetch.post('/api/auth/verify/2fa', {code: this.state.verificationCode})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(UpdateUser(resp.data.user));
                this.setState({status: '', configure2fa: false});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
            LogError(err, '/api/auth/verify/2fa');
        });
    }

    disable2fa(password, code) {
        this.setState({status: 'Disabling 2FA'});

        fetch.post('/api/auth/disable/2fa', {code: code, password: password})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(UpdateUser(resp.data.user));
            }

            this.setState({status: '', configure2fa: false});
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
            LogError(err, '/api/auth/disable/2fa');
        });
    }

    confirmCloseAccount() {
        this.props.dispatch(PromptOpen('Enter your password:', '', {action: 'close account', type: 'password'}));
    }

    closeAccount(password) {
        fetch.post('/api/account/close', {user: this.props.user.user.username, password: password})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(LogoutUser());
            } else if (resp.data.status === 'error') {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            LogError(err, '/api/account/close');
            this.props.dispatch('error', 'An error occurred');
        });
    }

    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        }

        let twoFactorConfig;

        if (this.state.status === 'Loading 2FA' && this.state.configure2fa) {
            twoFactorConfig = <div className='text-center'><FontAwesomeIcon icon={faCircleNotch} size='5x' spin /></div>;
        } else if (this.state.imageUrl && this.state.configure2fa) {
            twoFactorConfig = <div className='mt-3'>
                <div className='text-center mb-3'><img className='two-fa-qr' src={this.state.imageUrl} /></div>

                <div className='mb-3'>Please scan the QR code into your authenticator app. Then, enter the 6 digits shown on your app into the field below and press Verify.</div>

                <InputWrapper label='6 Digit Verification' required className='mb-3'>
                    <input type='text' onChange={(e) => this.setState({verificationCode: e.target.value})} />
                </InputWrapper>

                <div className='text-right'><SubmitButton type='button' loading={this.state.status === 'Verifying 2FA'} value='Verify' onClick={this.verify2fa.bind(this)} /></div>
            </div>;
        } else if (this.state.status === '2fa error') {
            twoFactorConfig = <div className='text-center'>
                An error occurred while generating the QR code
            </div>
        }

        if (this.props.user.user) {
            return(
                <section id='user-settings' className='main-panel'>
                    <TitledContainer title='Account Settings' bgColor='orange' icon={<FontAwesomeIcon icon={faUserCircle} />} shadow>
                        <PersonalSettings user={this.props.user} />
        
                        <div className='setting-field-container stretched mb-3'>
                            <div className='settings-col'><PasswordSettings /></div>
                            <div className='settings-col'>
                                <div className='simple-container no-bg'>
                                    <div className='simple-container-title'>Security</div>

                                    <div className='d-flex-between-center'>
                                        <label>Two-factor Authentication</label>
            
                                        {this.props.user.user && this.props.user.user.two_fa_enabled ? <button className='btn btn-danger' onClick={() => this.props.dispatch(PromptOpen(`Enter your password:`, '', {action: 'disable 2fa 1', type: 'password'}))}>Disable</button> : <button className='btn btn-primary' onClick={this.configure2fa.bind(this)}>{this.state.configure2fa ? 'New QR' : 'Configure'}</button>}
                                    </div>

                                    {twoFactorConfig}
                                </div>
                            </div>
                        </div>
        
                        <div className='simple-container no-bg setting-field-container mb-3'>
                            <div className='simple-container-title'>Settings</div>

                            <div className='settings-col'>
                                <div className='setting-col-field mb-3'>
                                    <label>Hide email:</label>
        
                                    <div className='d-flex'>
                                        {this.state.status === 'hide_email' ? <div className='p-relative mr-2'><Loading /></div> : ''}
                                        <SlideToggle status={this.props.user.user && this.props.user.user.hide_email ? this.props.user.user.hide_email : false} onClick={() => this.saveSetting('hide_email')} />
                                    </div>
                                </div>
        
                                <div className='setting-col-field mb-3'>
                                    <label>Show full name:</label>
        
                                    <div className='d-flex'>
                                        {this.state.status === 'display_fullname' ? <div className='p-relative mr-2'><Loading /></div> : ''}
                                        <SlideToggle status={this.props.user.user && this.props.user.user.display_fullname ? this.props.user.user.display_fullname : false} onClick={() => this.saveSetting('display_fullname')} />
                                    </div>
                                </div>
                            </div>

                            <div className='settings-col'>
                                <div className='setting-col-field mb-3'>
                                    <label>Receive Hire World emails:</label>
        
                                    <div className='d-flex'>
                                        {this.state.status === 'email_notifications' ? <div className='p-relative mr-2'><Loading /></div> : ''}
                                        <SlideToggle status={this.props.user.user && this.props.user.user.email_notifications ? this.props.user.user.email_notifications : false} onClick={() => this.saveSetting('email_notifications')} />
                                    </div>
                                </div>
        
                                <div className='setting-col-field mb-3'>
                                    <label>Enable Messaging:</label>
        
                                    <div className='d-flex'>
                                        {this.state.status === 'allow_messaging' ? <div className='p-relative mr-2'><Loading /></div> : ''}
                                        <SlideToggle status={this.props.user.user && this.props.user.user.allow_messaging ? this.props.user.user.allow_messaging : false} onClick={() => this.saveSetting('allow_messaging')} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='text-right'><button className='btn btn-danger' onClick={this.confirmCloseAccount.bind(this)}>Close Account</button></div>
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
        sectors: state.Sectors.sectors,
        prompt: state.Prompt
    }
}

export default withRouter(connect(mapStateToProps)(AccountSettings));