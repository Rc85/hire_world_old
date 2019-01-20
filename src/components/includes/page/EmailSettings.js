import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert } from '../../../actions/AlertActions';
import SubmitButton from '../../utils/SubmitButton';
import { UpdateUser } from '../../../actions/LoginActions';
import fetch from 'axios';
import { LogError } from '../../utils/LogError';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UncontrolledTooltip } from 'reactstrap';
import Tooltip from '../../utils/Tooltip';
import InputWrapper from '../../utils/InputWrapper';
import { isTyping } from '../../../actions/ConfigActions';

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
                this.props.dispatch(UpdateUser(resp.data.user));

                this.setState({status: '', statusMessage: '', newEmail: '', confirmEmail: ''});
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
                    <div className='d-flex-between-center mb-3'>
                        <div>Current Email: {this.props.user.user_email}</div>

                        <Tooltip text='You will not be able to log in until you verify your new email' placement='left' className='tooltip-icon'><FontAwesomeIcon icon={faQuestionCircle} id='change-email-tip' /></Tooltip>
                    </div>

                    <div className='mobile-tooltip mb-3'>You will not be able to log in until you verify your new email</div>

                    <div className='mb-3'>
                        <div className='mb-3'>
                            <InputWrapper label='New Email'>
                                <input type='email' name='new_email' id='new-email' onChange={(e) => this.setState({newEmail: e.target.value})} value={this.state.newEmail} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                            </InputWrapper>
                        </div>

                        <div className='mb-3'>
                            <InputWrapper label='Confirm Email'>
                                <input type='email' name='confirm_email' id='confirm-email' onChange={(e) => this.setState({confirmEmail: e.target.value})} autoComplete='off' value={this.state.confirmEmail} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                            </InputWrapper>
                        </div>
                    </div>
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Save' loading={this.state.status === 'Loading'} onClick={() => this.save()} disabled={!this.state.newEmail || !this.state.confirmEmail} />
                </div>
            </div>
        )
    }
}

export default connect()(EmailSettings);