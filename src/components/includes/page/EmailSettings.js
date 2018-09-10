import React, { Component } from 'react';
import SlideToggle from '../../utils/SlideToggle';
import { connect } from 'react-redux';
import Alert from '../../utils/Alert';
import SubmitButton from '../../utils/SubmitButton';
import { SaveEmail } from '../../../actions/SettingsActions';
import PropTypes from 'prop-types';

class EmailSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            newEmail: '',
            confirmEmail: '',
            hideEmail: false,
            emailNotifications: false,
            status: '',
            statusMessage: ''
        }
    }

    componentDidMount() {
        if (this.props.user) {
            this.setState({
                hideEmail: this.props.user.user.hide_email,
                emailNotifications: this.props.user.user.email_notifications
            });
        }
    }

    save() {
        let emailCheck = /^[a-zA-Z0-9_\-]+(\.{1}[a-zA-Z0-9_\-]*){0,2}@{1}[a-zA-Z0-9_\-]+\.([a-zA-Z0-9_\-]*\.{1}){0,2}[a-zA-Z0-9_\-]{2,}$/;
        
        if (emailCheck.test(this.state.newEmail) && emailCheck.test(this.state.confirmEmail)) {
            if (this.state.newEmail === this.state.confirmEmail) {
                this.props.dispatch(SaveEmail(this.state, this.props.user.user));
            } else {
                this.setState({
                    status: 'error',
                    statusMessage: 'Emails do not match'
                });
            }
        } else {
            this.setState({
                status: 'error',
                statusMessage: 'Invalid email format'
            });
        }
    }

    render() {
        let error;

        if (this.state.status) {
            error = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />
        }

        switch(this.props.user.status) {
            case 'save email error': error = <Alert status='error' message='An error occurred' unmount={() => this.setState({status: '', statusMessage: ''})} />; break;
            case 'save email success': error = <Alert status='success' message='New email saved' unmount={() => this.setState({status: '', statusMessage: ''})} />; break;
        }

        return(
            <div id='email-settings' className='settings-col'>
                {error}
                <div>
                    <label>Change Email:</label>

                    <div className='bordered-container rounded mb-3'>
                        <div className='mb-3'>
                            <label htmlFor='new-email'>New Email:</label>
                            <input type='email' name='new_email' id='new-email' className='form-control' onChange={(e) => this.setState({newEmail: e.target.value})} />
                        </div>

                        <div className='mb-3'>
                            <label htmlFor='confirm-email'>Confirm Email:</label>
                            <input type='email' name='confirm_email' id='confirm-email' className='form-control' onChange={(e) => this.setState({confirmEmail: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className='settings-row mb-3'>
                    <span>Hide Email:</span>
                    <SlideToggle status={this.state.hideEmail ? 'Active' : 'Inactive'} onClick={() => this.setState({hideEmail: !this.state.hideEmail})} />
                </div>

                <div className='settings-row mb-3'>
                    <span>Email Notifications:</span>
                    <SlideToggle status={this.state.emailNotifications ? 'Active' : 'Inactive'} onClick={() => this.setState({emailNotifications: !this.state.emailNotifications})} />
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Save' loading={/loading$/.test(this.state.status)} onClick={() => this.save()} />
                </div>
            </div>
        )
    }
}

EmailSettings.propTypes = {
    user: PropTypes.object.isRequired
}

export default connect()(EmailSettings);