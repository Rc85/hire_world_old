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

class PaymentMethods extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            edit: false,
            source: this.props.defaultSource,
            ...this.props.payment
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data && nextProps.confirm.data.id === this.props.payment.id) {
            if (nextProps.confirm.data.action === 'delete payment' && nextProps.confirm.option) {
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

    save() {
        fetch.post('/api/user/payment/edit', this.state)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', edit: false});
                this.props.updateCard(resp.data.card);
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/user/payment/edit'));
    }

    render() {
        console.log(this.props.status);
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
                <div className='setting-field-container mb-3'>
                    <div className='setting-field-container '>
                        <div className='payment-brand'>{brand}</div>
        
                        <div className='payment-method-info'>
                            <div><strong>Card Number: </strong> **** **** **** {this.props.payment.last4} {this.props.defaultSource === this.props.payment.id ? <div className='badge badge-success ml-2'>Default</div> : ''}</div>
                            <div><strong>Expiry Date: </strong>{this.props.payment.exp_month} / {this.props.payment.exp_year}</div>
                        </div>
                    </div>
    
                    <div>
                        {this.props.defaultSource !== this.props.payment.id ? <button className='btn btn-primary mr-1' onClick={() => this.props.setDefault(this.props.payment.id)} disabled={this.props.status === 'Setting'}>Set as Default</button> : ''}
                        <button className='btn btn-info mr-1' onClick={() => this.setState({edit: !this.state.edit})}>{this.state.edit ? 'Cancel' : 'Edit'}</button>
                        <button className='btn btn-secondary' onClick={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to delete this card?`, `This cannot be reverted and your next most recent added card will be used.`, {action: 'delete payment', id: this.props.payment.id}))} disabled={this.props.status === 'Setting'}><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                </div>
    
                
                {this.state.edit ? <div className='bordered-container no-top mb-5'>
                    <AddressInput saveable={false} info={this.state} set={(key, val) => this.set(key, val)} />
                    <div className='text-right'><SubmitButton type='button' onClick={() => this.save()} loading={this.state.status === 'Loading' || this.props.status === 'Setting'} value='Save' /></div>
                </div> : ''}
            </div>
        );
    }
}

PaymentMethods.propTypes = {

};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(PaymentMethods);