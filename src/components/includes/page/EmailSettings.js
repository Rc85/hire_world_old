import React, { Component } from 'react';
import SlideToggle from '../../utils/SlideToggle';
import { connect } from 'react-redux';
import Alert from '../../utils/Alert';
import SubmitButton from '../../utils/SubmitButton';
import { UpdateUser } from '../../../actions/LoginActions';
import PropTypes from 'prop-types';
import fetch from 'axios';

class EmailSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            newEmail: '',
            confirmEmail: '',
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
                fetch.post('/api/user/settings/email/change', this.state)
                .then(resp => {
                    if (resp.data.status === 'success') {
                        this.props.dispatch(UpdateUser(resp.data.user));
                    }

                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                })
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
            <div id='email-settings'>
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
                            <input type='email' name='confirm_email' id='confirm-email' className='form-control' onChange={(e) => this.setState({confirmEmail: e.target.value})} autoComplete='off' />
                        </div>
                    </div>
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