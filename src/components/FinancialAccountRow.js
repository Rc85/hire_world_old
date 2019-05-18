import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUniversity, faTrash } from '@fortawesome/pro-solid-svg-icons';
import { faCcVisa, faCcMastercard } from '@fortawesome/free-brands-svg-icons';
import { ShowConfirmation, ResetConfirmation } from '../actions/ConfirmationActions';
import { connect } from 'react-redux';
import { IsTyping } from '../actions/ConfigActions';
import InputWrapper from './utils/InputWrapper';
import SubmitButton from './utils/SubmitButton';
/* import fetch from 'axios';
import { UpdateUser } from '../actions/LoginActions';
import { Alert } from '../actions/AlertActions';
import { LogError } from './utils/LogError'; */

class FinancialAccountRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            edit: false,
            accountHolder: this.props.account.account_holder_name || null,
            accountType: this.props.account.account_holder_type || null,
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.confirm.data && this.props.confirm.option && prevProps.confirm.option !== this.props.confirm.option) {
            if (this.props.confirm.data.action === 'delete payment' && this.props.confirm.data.id === this.props.account.id) {
                this.props.delete();
                this.props.dispatch(ResetConfirmation());
            }
        }
    }


    /* verify() {
        this.setState({status: 'Verifying'});

        fetch.post('/api/link-work/bank/verify', {deposit1: this.state.deposit1, deposit2: this.state.deposit2, bank_id: this.props.account.id, account_id: this.props.account.account})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(UpdateUser());
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            this.setState({status: ''});
        })
        .catch(err => {
            LogError(err, 'api/link-work/bank/verify');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    } */
    
    render() {
        let icon, info;

        if (this.props.account.object === 'card' && this.props.account.brand === 'Visa') {
            icon = <FontAwesomeIcon icon={faCcVisa} size='3x' className='financial-account-icon' />;
        } else if (this.props.account.object === 'card' && this.props.account.brand === 'MasterCard') {
            icon = <FontAwesomeIcon icon={faCcMastercard} size='3x' className='financial-account-icon' />;
        } else if (this.props.account.object === 'bank_account') {
            icon = <FontAwesomeIcon icon={faUniversity} size='3x' className='financial-account-icon' />;
        }

        if (this.props.account.object === 'card') {
            info = <div className='financial-account-row'>
                <div className='financial-account-details'><strong className='mr-2'>{this.props.account.brand} {this.props.account.funding.charAt(0).toUpperCase() + this.props.account.funding.substr(1)}</strong></div>
                <div className='financial-account-currency'>
                    <span className='mini-badge mini-badge-info mr-2'>{this.props.account.currency.toUpperCase()}</span>
                    {this.props.account.default_for_currency ? <span className='mini-badge mini-badge-success'>Default</span> : ''}
                </div>
                <div className='financial-account-details'>**** **** **** {this.props.account.last4}</div>
                <div className='financial-account-details'><strong>Expiry Date:</strong> {this.props.account.exp_month}/{this.props.account.exp_year}</div>
                <div className='financial-account-details'><strong>Available Payout Methods:</strong> {this.props.account.available_payout_methods.map((payout, i) => {
                    return <span key={i} className='mini-badge mini-badge-lightblue mr-1'>{payout}</span>;
                })}</div>
            </div>;
        } else if (this.props.account.object === 'bank_account') {
            info = <div className='financial-account-row'>
                <div className='financial-account-details'>
                    <strong>{this.props.account.bank_name}</strong>
                </div>
                <div className='financial-account-currency mb-1'>
                    <span className='mini-badge mini-badge-info mr-2'>{this.props.account.currency.toUpperCase()}</span>
                    {this.props.account.default_for_currency ? <span className='mini-badge mini-badge-success mr-2'>Default</span> : ''}
                    {this.props.account.status === 'new' ? <span className='mini-badge mini-badge-secondary'>Unverified</span> : ''}
                    {this.props.account.status === 'validated' ? <span className='mini-badge mini-badge-success'>Validated</span> : ''}
                    {this.props.account.status === 'verification_failed' ? <span className='mini-badge mini-badge-danger'>Verification Failed</span> : ''}
                    {this.props.account.status === 'errored' ? <span className='mini-badge mini-badge-danger'>Errored</span> : ''}
                </div>
                <div className='financial-account-details'>***** {this.props.account.last4}</div>
                <div className='financial-account-details'><strong>Routing Number:</strong> <span>{this.props.account.routing_number}</span></div>
            </div>;
        }

        /* let verify;

        if (this.state.verify) {
            verify = <div className='financial-info-verify'>
                <div className='mb-3'>Input the two micro-deposits that appeared on your statement with the description <strong>AMTS</strong>.</div>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Deposit #1' required>
                            <input type='text' onChange={(e) => this.setState({deposit1: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputWrapper label='Deposit #2' required>
                            <input type='text' onChange={(e) => this.setState({deposit2: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputWrapper>
                    </div>
                </div>

                <div className='text-right'><SubmitButton type='button' loading={this.state.status === 'Verifying'} value='Verify' onClick={this.verify.bind(this)} /></div>
            </div>
        } */
        
        return (
            <React.Fragment>
                <div className='financial-info-container mb-3'>
                    <div className='financial-info'>
                        {icon}
                        {info}
                    </div>
    
                    <div className='financial-info-buttons'>
                        {!this.props.account.default_for_currency ? <button type='button' className='btn btn-primary' onClick={() => this.props.setDefault()} disabled={this.state.status === 'Setting Default'}>Set as Default</button> : ''}
                        {/* this.props.account.status === 'new' ? <button className='btn btn-success' type='button' onClick={() => this.setState({verify: !this.state.verify})}>Verify</button> : '' */}
                        <button type='button' className='btn btn-secondary' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to delete this payment account?', false, {action: 'delete payment', id: this.props.account.id}))}><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                </div>

                {/* verify */}
            </React.Fragment>
        );
    }
}

FinancialAccountRow.propTypes = {
    account: PropTypes.object,
    setDefault: PropTypes.func,
    delete: PropTypes.func
};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(FinancialAccountRow);