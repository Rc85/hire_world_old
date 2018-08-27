import React, { Component } from 'react';
import { connect } from 'react-redux';
import fetch from 'axios';
import Alert from '../../utils/Alert';
import SubmitButton from '../../utils/SubmitButton';

class PasswordSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            status: '',
            showPassword: false
        }
    }

    save() {
        let blankCheck = /^\s*$/;
        let charCheck = /.{6,15}/;

        if (blankCheck.test(this.state.currentPassword) || blankCheck.test(this.state.newPassword)) {
            this.setState({status: 'blank passwords'});
        } else if (!charCheck.test(this.state.newPassword) || !charCheck.test(this.state.confirmPassword)) {
            this.setState({status: 'short password'});
        } else {
            this.setState({status: 'loading'});

            if (this.state.newPassword === this.state.confirmPassword) {
                fetch.post('/api/user/settings/password/change', this.state)
                .then(resp => {
                    console.log(resp);
                    this.setState({status: resp.data.status});
                });
            } else {
                this.setState({status: 'unmatched'});
            }
        }

        setTimeout(() => {
            this.setState({status: ''});
        }, 2000);
    }

    render() {
        let error, showHide;

        switch(this.state.status) {
            case 'unmatched': error = <Alert status='error' message='Passwords do not match' />; break;
            case 'user not found': error = <Alert status='error' message='User not found' />; break;
            case 'incorrect password': error = <Alert status='error' message='Incorrect password' />; break;
            case 'password save error': error = <Alert status='error' />; break;
            case 'password save success': error = <Alert status='success' message='New password saved' />; break;
            case 'blank passwords': error = <Alert status='error' message='Password cannot be blank' />; break;
            case 'short password': error = <Alert status='error' message='New password(s) too short' />; break;
        }

        if (this.state.showPassword) {
            showHide = 'Hide';
        } else {
            showHide = 'Show';
        }

        return(
            <div id='password-settings' className='settings-col'>
                {error}
                <div>
                    <div className='d-flex justify-content-between'>
                        <label>Change Password:</label>

                        <span style={{fontWeight: 'bold', cursor: 'pointer'}} onClick={() => this.setState({showPassword: !this.state.showPassword})}>{showHide}</span>
                    </div>

                    <div className='region-container rounded mb-3'>
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
                    <SubmitButton type='button' value='Save' onClick={() => this.save()} loading={this.state.status} />
                </div>
            </div>
        )
    }
}

export default connect()(PasswordSettings);