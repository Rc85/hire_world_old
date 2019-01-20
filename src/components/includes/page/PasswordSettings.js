import React, { Component } from 'react';
import { connect } from 'react-redux';
import fetch from 'axios';
import { Alert } from '../../../actions/AlertActions';
import SubmitButton from '../../utils/SubmitButton';
import Loading from '../../utils/Loading';
import { LogError } from '../../utils/LogError';
import InputWrapper from '../../utils/InputWrapper';
import { isTyping } from '../../../actions/ConfigActions';

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
        this.setState({status: 'Loading'});

        fetch.post('/api/user/settings/password/change', this.state)
        .then(resp => {
            this.setState({status: '', currentPassword: '', newPassword: '', confirmPassword: ''});

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/user/settings/password/change'));
    }

    render() {
        let status, showHide;

        if (this.state.status === 'Loading') {
            status = <Loading size='3x' />;
        }

        if (this.state.showPassword) {
            showHide = 'Hide';
        } else {
            showHide = 'Show';
        }

        return(
            <div id='password-settings' className='position-relative mb-3'>
                {status}
                <div>
                    <div className='text-right'>
                        <span style={{fontWeight: 'bold', cursor: 'pointer'}} onClick={() => this.setState({showPassword: !this.state.showPassword})}>{showHide}</span>
                    </div>

                    <div className='mb-3'>
                        <div className='mb-3'>
                            <InputWrapper label='Current Password'>
                                <input type={this.state.showPassword ? 'text' : 'password'} name='current_password' id='current-password' onChange={(e) => this.setState({currentPassword: e.target.value})} maxLength='15' value={this.state.currentPassword} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                            </InputWrapper>
                        </div>

                        <div className='mb-3'>
                            <InputWrapper label='New Password'>
                                <input type={this.state.showPassword ? 'text' : 'password'} name='new_password' id='new-password' onChange={(e) => this.setState({newPassword: e.target.value})} maxLength='15' value={this.state.newPassword} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                            </InputWrapper>
                        </div>

                        <div className='mb-3'>
                            <InputWrapper label='Confirm Password'>
                                <input type={this.state.showPassword ? 'text' : 'password'} name='confirm_password' id='confirm-password' onChange={(e) => this.setState({confirmPassword: e.target.value})} maxLength='15' value={this.state.confirmPassword} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                            </InputWrapper>
                        </div>
                    </div>
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Save' onClick={() => this.save()} loading={this.state.status === 'Loading'} disabled={this.state.currentPassword.length < 6 || this.state.newPassword.length < 6 || this.state.confirmPassword.length < 6}/>
                </div>
            </div>
        )
    }
}

export default connect()(PasswordSettings);