import React, { Component } from 'react';
import { connect } from 'react-redux';
import fetch from 'axios';
import Alert from '../../utils/Alert';
import SubmitButton from '../../utils/SubmitButton';
import Loading from '../../utils/Loading';

class PasswordSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            status: '',
            statusMessage: '',
            showPassword: false
        }
    }

    save() {
        let blankCheck = /^\s*$/;
        let charCheck = /.{6,15}/;

        if (blankCheck.test(this.state.currentPassword) || blankCheck.test(this.state.newPassword)) {
            this.setState({
                status: 'error',
                statusMessage: 'Passwords cannot be blank'
            });
        } else if (!charCheck.test(this.state.newPassword) || !charCheck.test(this.state.confirmPassword)) {
            this.setState({status: 'error', statusMessage: 'Password too short'});
        } else {
            if (this.state.newPassword === this.state.confirmPassword) {
                this.setState({status: 'Loading'});

                fetch.post('/api/user/settings/password/change', this.state)
                .then(resp => {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                });
            } else {
                this.setState({status: 'error', statusMessage: 'Passwords do not match'});
            }
        }
    }

    render() {
        let status, showHide;

        if (this.state.status === 'Loading') {
            status = <Loading size='3x' />;
        } else if (this.state.status === 'success' || this.state.status === 'error') {
            status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />;
        }

        if (this.state.showPassword) {
            showHide = 'Hide';
        } else {
            showHide = 'Show';
        }

        return(
            <div id='password-settings' className='position-relative'>
                {status}
                <div>
                    <div className='d-flex justify-content-between'>
                        <label>Change Password:</label>

                        <span style={{fontWeight: 'bold', cursor: 'pointer'}} onClick={() => this.setState({showPassword: !this.state.showPassword})}>{showHide}</span>
                    </div>

                    <div className='bordered-container rounded mb-3'>
                        <div className='mb-3'>
                            <label htmlFor='current-password'>Current Password:</label>
                            <input type={this.state.showPassword ? 'text' : 'password'} name='current_password' id='current-password' className='form-control' onChange={(e) => this.setState({currentPassword: e.target.value})} maxLength='15' />
                        </div>

                        <div className='mb-3'>
                            <label htmlFor='new-password'>New Password:</label>
                            <input type={this.state.showPassword ? 'text' : 'password'} name='new_password' id='new-password' className='form-control' onChange={(e) => this.setState({newPassword: e.target.value})} maxLength='15' />
                        </div>

                        <div className='mb-3'>
                            <label htmlFor='confirm-password'>Confirm Password:</label>
                            <input type={this.state.showPassword ? 'text' : 'password'} name='confirm_password' id='confirm-password' className='form-control' onChange={(e) => this.setState({confirmPassword: e.target.value})} maxLength='15' />
                        </div>
                    </div>
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Save' onClick={() => this.save()} loading={this.state.status === 'Loading'} />
                </div>
            </div>
        )
    }
}

export default connect()(PasswordSettings);