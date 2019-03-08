import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCcVisa, faCcMastercard, faCcAmex } from '@fortawesome/free-brands-svg-icons';
import AddressInput from './AddressInput';
import SubmitButton from '../../utils/SubmitButton';
import { Alert } from '../../../actions/AlertActions';
import { LogError } from '../../utils/LogError';
import fetch from 'axios';
import { connect } from 'react-redux';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';
import InputWrapper from '../../utils/InputWrapper';

class PaymentMethods extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            edit: false,
            source: this.props.defaultSource,
            ...this.props.payment
        }
    }

    /* componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data && nextProps.confirm.data.id === this.props.payment.id) {
            if (nextProps.confirm.data.action === 'delete payment' && nextProps.confirm.option) {
                this.props.delete(this.props.payment.id);
                this.props.dispatch(ResetConfirmation());
            }
        }
    } */

    componentDidUpdate(prevProps, prevState) {
        if (this.props.confirm.data) {
            if (this.props.confirm.data.action === 'delete payment' && this.props.confirm.data.id === this.props.payment.id && this.props.confirm.option) {
                this.props.delete(this.props.payment.id);
                this.props.dispatch(ResetConfirmation());
            }
        }
    }
        
    set(key, val) {
        let obj = {};
        obj[key] = val;

        this.setState(obj);
    }

    render() {
        let brand;

        if (this.props.payment.brand === 'Visa') {
            brand = <FontAwesomeIcon icon={faCcVisa} size='3x' />;
        } else if (this.props.payment.brand === 'MasterCard') {
            brand = <FontAwesomeIcon icon={faCcMastercard} size='3x' />;
        } else if (this.props.payment.brand === 'American Express') {
            brand = <FontAwesomeIcon icon={faCcAmex} size='3x' />;
        }

        return (
            <div className='payment-method'>
                <div className='payment-method-container'>
                    <div className='payment-method-detail-container'>
                        <div className='payment-brand'>{brand}</div>
        
                        <div className='payment-method-info'>
                            <div className='mb-1'><strong>{this.props.payment.brand} {this.props.payment.funding.charAt(0).toUpperCase() + this.props.payment.funding.substr(1)}</strong></div>
                            <div className='mb-1'>**** **** **** {this.props.payment.last4} {this.props.defaultSource === this.props.payment.id ? <div className='mini-badge mini-badge-success ml-2'>Default</div> : ''}</div>
                            <div><strong>Expiry Date:</strong> {this.props.payment.exp_month} / {this.props.payment.exp_year}</div>
                        </div>
                    </div>

                    <div className='payment-methods-buttons'>
                        {this.props.defaultSource !== this.props.payment.id ? <button className='btn btn-primary mr-1' onClick={() => this.props.setDefault(this.props.payment.id)} disabled={this.props.status === 'Setting'}>Set as Default</button> : ''}
                        <button className='btn btn-info mr-1' onClick={() => this.setState({edit: !this.state.edit})}>{this.state.edit ? 'Cancel' : 'Edit'}</button>
                        <button className='btn btn-secondary' onClick={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to delete this card?`, `This cannot be reverted and your next most recent added card will be used.`, {action: 'delete payment', id: this.props.payment.id}))} disabled={this.props.status === 'Setting'}><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                </div>
    
                
                {this.state.edit ? <div className='simple-container no-bg mb-5'>
                    <div className='simple-container-title'>Edit</div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        this.setState({edit: false});
                        this.props.save(this.state);
                    }}>
                        <InputWrapper label='Card Expiry Date' className='mb-3'>
                            <input type='number' onChange={(e) => this.setState({card_exp_month: e.target.value})} maxLength='2' placeholder='MM' />
                            <input type='number' onChange={(e) => this.setState({card_exp_year: e.target.value})} maxLength='2' placeholder='YYYY' />
                        </InputWrapper>
    
                        <AddressInput saveable={false} info={this.state} set={(key, val) => this.set(key, val)} />
                        <div className='text-right'><SubmitButton type='submit' loading={this.state.status === 'Editing' || this.props.status === 'Setting'} value='Save' /></div>
                    </form>
                </div> : ''}
            </div>
        );
    }
}

PaymentMethods.propTypes = {
    status: PropTypes.string,
    payment: PropTypes.object,
    defaultSource: PropTypes.string,
    updateCard: PropTypes.func,
    setDefault: PropTypes.func,
    delete: PropTypes.func
};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(PaymentMethods);