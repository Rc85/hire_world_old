import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCcVisa, faCcMastercard, faCcAmex } from '@fortawesome/free-brands-svg-icons';
import AddressInput from '../../utils/AddressInput';
import SubmitButton from '../../utils/SubmitButton';
import { Alert } from '../../../actions/AlertActions';
import { LogError } from '../../utils/LogError';
import fetch from 'axios';
import { connect } from 'react-redux';

class PaymentMethods extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            edit: false,
            source: this.props.defaultSource,
            ...this.props.payment
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
            console.log(resp);
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
        let brand;

        if (this.props.payment.brand === 'Visa') {
            brand = <FontAwesomeIcon icon={faCcVisa} size='3x' />;
        } else if (this.props.payment.brand === 'MasterCard') {
            brand = <FontAwesomeIcon icon={faCcMastercard} size='3x' />;
        } else if (this.props.payment.brand === 'American Express') {
            brand = <FontAwesomeIcon icon={faCcAmex} size='3x' />;
        }

        return (
            <div id='payment-methods'>
                <div className='d-flex-between-start mb-3'>
                    <div className='d-flex'>
                        <div className='mr-3'>{brand}</div>
        
                        <div>
                            <div><strong>Card Number: </strong> **** **** **** {this.props.payment.last4} {this.props.defaultSource === this.props.payment.id ? <div className='badge badge-success ml-2'>Default</div> : ''}</div>
                            <div><strong>Expiry Date: </strong>{this.props.payment.exp_month} / {this.props.payment.exp_year}</div>
                        </div>
                    </div>
    
                    <div>
                        {this.props.defaultSource !== this.props.payment.id ? <button className='btn btn-primary mr-1'>Set as Default</button> : ''}
                        <button className='btn btn-info mr-1' onClick={() => this.setState({edit: !this.state.edit})}>{this.state.edit ? 'Cancel' : 'Edit'}</button>
                        <button className='btn btn-secondary'>Delete</button>
                    </div>
                </div>
    
                
                    {this.state.edit ? <div className='bordered-container no-top mb-5'>
                        <AddressInput saveable={false} info={this.state} set={(key, val) => this.set(key, val)} />
                        <div className='text-right'><SubmitButton type='button' onClick={() => this.save()} loading={this.state.status === 'Loading'} value='Save' /></div>
                    </div> : ''}
                
            </div>
        );
    }
}

PaymentMethods.propTypes = {

};

export default connect()(PaymentMethods);