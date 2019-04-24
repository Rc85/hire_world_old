import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert } from '../../../actions/AlertActions';
import SubmitButton from '../../utils/SubmitButton';
import { UpdateUser, LogoutUser } from '../../../actions/LoginActions';
import fetch from 'axios';
import { LogError } from '../../utils/LogError';
import { faQuestionCircle } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from '../../utils/Tooltip';
import InputWrapper from '../../utils/InputWrapper';
import { IsTyping } from '../../../actions/ConfigActions';

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

    save() {
        this.setState({status: 'Loading'});

        fetch.post('/api/user/settings/email/change', this.state)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(LogoutUser());
            } else if (resp.data.status === 'error') {
                this.setState({status: '', statusMessage: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/user/settings/email/change'));
    }

    render() {
        return(
            <div id='email-settings' className='mb-3'>
                <div>
                    <div className='mb-3'><small>NOTE: You will be logged out and not be able to log in until you verify your new email</small></div>

                    <div className='mb-3'>
                        <div className='mb-3'>
                            <InputWrapper label='New Email'>
                                <input type='email' name='new_email' id='new-email' onChange={(e) => this.setState({newEmail: e.target.value})} value={this.state.newEmail} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                            </InputWrapper>
                        </div>

                        <div className='mb-3'>
                            <InputWrapper label='Confirm Email'>
                                <input type='email' name='confirm_email' id='confirm-email' onChange={(e) => this.setState({confirmEmail: e.target.value})} autoComplete='off' value={this.state.confirmEmail} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                            </InputWrapper>
                        </div>
                    </div>
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Save' loading={this.state.status === 'Loading'} onClick={() => this.save()} disabled={this.state.newEmail !== this.state.confirmEmail || !this.state.newEmail && !this.state.confirmEmail} />
                </div>
            </div>
        )
    }
}

export default connect()(EmailSettings);