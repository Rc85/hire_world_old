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
                    <div className='d-flex-end-center'>
                        <div>
                            <FontAwesomeIcon icon={faQuestionCircle} id='change-email-tip' />
                            <UncontrolledTooltip placement='top' target='change-email-tip'>You will not be able to log in until you verify your new email</UncontrolledTooltip>
                        </div>
                    </div>

                    <div className='mb-3'>
                        <div className='mb-3'>
                            <label htmlFor='new-email'>New Email:</label>
                            <input type='email' name='new_email' id='new-email' className='form-control' onChange={(e) => this.setState({newEmail: e.target.value})} value={this.state.newEmail} />
                        </div>

                        <div className='mb-3'>
                            <label htmlFor='confirm-email'>Confirm Email:</label>
                            <input type='email' name='confirm_email' id='confirm-email' className='form-control' onChange={(e) => this.setState({confirmEmail: e.target.value})} autoComplete='off' value={this.state.confirmEmail} />
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