import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CardNumberElement, CardCVCElement, CardExpiryElement, injectStripe } from 'react-stripe-elements';
import SubmitButton from '../utils/SubmitButton';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import { Alert } from '../../actions/AlertActions';
import PaymentMethods from '../includes/page/PaymentMethods';
import AddressInput from '../utils/AddressInput';
import { connect } from 'react-redux';

class PaymentSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            defaultAddress: this.props.user.user.user_address && this.props.user.user.user_city && this.props.user.user.user_region && this.props.user.user.user_country && this.props.user.user.user_city_code ? true : false,
            saveAddress: false,
            payments: []
        }
    }

    componentDidMount() {
        fetch.post('/api/get/payments')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', payments: resp.data.payments, defaultSource: resp.data.defaultSource});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/get/payments'));
    }
    
    async save() {
        this.setState({status: 'Adding'});

        let { token } = await this.props.stripe.createToken({
            name: this.state.name ? this.state.name : `${this.props.user.user.user_firstname} ${this.props.user.user.user_lastname}`,
            address_line1: this.state.defaultAddress ? this.props.user.user.user_address : this.state.address_line1,
            address_city: this.state.defaultAddress ? this.props.user.user.user_city : this.state.address_city,
            address_state: this.state.defaultAddress ? this.props.user.user.user_region : this.state.address_state,
            address_zip: this.state.defaultAddress ? this.props.user.user.user_city_code : this.state.address_zip,
            address_country: this.state.defaultAddress ? this.props.user.user.user_country : this.state.address_country
        });

        let data = {...this.state}
        data['token'] = token;

        fetch.post('/api/user/payment/add', data)
        .then(resp => {
            if (resp.data.status === 'success') {
                let payments = [...this.state.payments];
                payments.push(resp.data.card);

                this.setState({status: '', name: '', address_line1: '', address_country: '', address_city: '', address_state: '', address_zip: '', payments: payments, defaultSource: resp.data.defaultSource});
                this.CardExpiryElement.clear();
                this.CardNumberElement.clear();
                this.CardCVCElement.clear();
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/user/payment/add'));
    }

    set(key, val) {
        let obj = {};
        obj[key] = val;

        this.setState(obj);
    }

    updateCard(index, card) {
        let payments = [...this.state.payments];

        payments[index] = card;

        this.setState({payments: payments})
    }

    useDefaultAdress() {
        if (this.props.user.user.user_address && this.props.user.user.user_city && this.props.user.user.user_region && this.props.user.user.user_country && this.props.user.user.user_city_code) {
            this.setState({defaultAddress: !this.state.defaultAddress});
        } else {
            this.props.dispatch(Alert('error', 'No address to use'));
        }
    }

    setDefault(id) {
        this.setState({status: 'Setting'});

        fetch.post('/api/user/payment/default', {id: id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', defaultSource: resp.data.defaultSource});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/user/payment/default'));
    }

    delete(index, id) {
        this.setState({status: 'Setting'});

        fetch.post('/api/user/payment/delete', {id: id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let payments = [...this.state.payments];
                payments.splice(index, 1);

                this.setState({status: '', payments: payments, defaultSource: resp.data.defaultSource});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/user/payment/delete'));
    }
    
    render() {
        let address, paymentMethods;

        if (!this.state.defaultAddress) {
            address = <AddressInput saveable={true} info={this.state} set={(key, val) => this.set(key, val)} />;
        }

        if (this.state.payments.length > 0) {
            paymentMethods = this.state.payments.map((payment, i) => {
                return <PaymentMethods key={i} status={this.state.status} payment={payment} defaultSource={this.state.defaultSource} updateCard={(card) => this.updateCard(i, card)} setDefault={(id) => this.setDefault(id)} delete={(id) => this.delete(i, id)} />;
            });
        }

        return (
            <section className='blue-panel shallow three-rounded' id='payment-settings'>
                <div className='text-right'>
                    <img src='/images/powered_by_stripe.png' className='w-10 mr-1' />
                    <img src='/images/payment_methods.png' className='w-10' />
                </div>


                <div className='mb-3'>
                    <label htmlFor='nameOnCard'>Name on Card:</label>
                    <input type='text' name='name' id='nameOnCard' className='form-control' onChange={(e) => this.setState({name: e.target.value})} placeholder='Your name on your profile will be used if left blank' value={this.state.name} />
                </div>

                <div className='d-flex-between-center mb-3'>
                    <div className='w-45'>
                        <label htmlFor='cardNumber'>Card Number:</label>
                        <CardNumberElement className='form-control' onReady={el => this.CardNumberElement = el} />
                    </div>

                    <div className='d-flex-between-center w-45'>
                        <div className='w-45'>
                            <label htmlFor='expiryDate'>Expiry Date:</label>
                            <CardExpiryElement className='form-control' onReady={el => this.CardExpiryElement = el} />
                        </div>
    
                        <div className='w-45'>
                            <label htmlFor='cvc'>CVC:</label>
                            <CardCVCElement className='form-control' onReady={el => this.CardCVCElement = el} />
                        </div>
                    </div>
                </div>

                <label><input type='checkbox' name='default-address' id='useDefaultAddress' onChange={() => this.useDefaultAdress()} checked={this.state.defaultAddress} /> Use address registered with this account</label>

                {address}

                <div className='text-right'><SubmitButton type='button' onClick={() => this.save()} loading={this.state.status === 'Adding'} value='Add Payment' /></div>

                <hr/>

                {paymentMethods}
            </section>
        );
    }
}

PaymentSettings.propTypes = {
    user: PropTypes.object
};

export default connect()(injectStripe(PaymentSettings));