import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CardNumberElement, CardCVCElement, CardExpiryElement, injectStripe } from 'react-stripe-elements';
import SubmitButton from '../utils/SubmitButton';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import { Alert } from '../../actions/AlertActions';
import PaymentMethods from '../includes/page/PaymentMethods';
import AddressInput from '../utils/AddressInput';

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
            console.log(resp);
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
        this.setState({status: 'Loading'});

        let { token } = await this.props.stripe.createToken({
            name: this.state.name ? this.state.name : `${this.props.user.user.user_firstname} ${this.props.user.user.user_lastname}`,
            address_line1: this.state.defaultAddress ? this.props.user.user.user_address : this.state.address,
            address_city: this.state.defaultAddress ? this.props.user.user.user_city : this.state.city,
            address_state: this.state.defaultAddress ? this.props.user.user.user_region : this.state.region,
            address_zip: this.state.defaultAddress ? this.props.user.user.user_city_code : this.state.cityCode,
            address_country: this.state.defaultAddress ? this.props.user.user.user_country : this.state.country
        });

        let data = {...this.state}
        data['token'] = token;

        fetch.post('/api/user/payment/add', data)
        .then(resp => {
            if (resp.data.status === 'success') {
                let payments = [...this.state.payments];
                payments.push(resp.data.card);

                this.setState({status: '', name: '', address: '', country: '', city: '', region: '', cityCode: '', payments: payments});
                this.CardExpiryElement.clear();
                this.CardNumberElement.clear();
                this.CardCVCElement.clear();
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
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
    
    render() {
        let address, paymentMethods;

        if (!this.state.defaultAddress) {
            address = <AddressInput saveable={true} info={this.state} set={(key, val) => this.set(key, val)} />;
        }

        if (this.state.payments.length > 0) {
            paymentMethods = this.state.payments.map((payment, i) => {
                return <PaymentMethods key={i} payment={payment} defaultSource={this.state.defaultSource} updateCard={(card) => this.updateCard(i, card)} />;
            });
        }

        return (
            <section className='blue-panel shallow three-rounded' id='payment-settings'>
                <div className='mb-3'>
                    <label htmlFor='nameOnCard'>Name on Card:</label>
                    <input type='text' name='name' id='nameOnCard' className='form-control' onChange={(e) => this.setState({name: e.target.value})} placeholder='Your name on your profile will be used if left blank' />
                </div>

                <div className='d-flex-between-center mb-3'>
                    <div className='w-45'>
                        <label htmlFor='cardNumber'>Card Number:</label>
                        <CardNumberElement className='form-control' onReady={el => this.CardNumberElement = el} />
                    </div>

                    <div className='w-25'>
                        <label htmlFor='expiryDate'>Expiry Date:</label>
                        <CardExpiryElement className='form-control' onReady={el => this.CardExpiryElement = el} />
                    </div>

                    <div className='w-25'>
                        <label htmlFor='cvc'>CVC:</label>
                        <CardCVCElement className='form-control' onReady={el => this.CardCVCElement = el} />
                    </div>
                </div>

                <label><input type='checkbox' name='default-address' id='useDefaultAddress' onClick={() => this.setState({defaultAddress: !this.state.defaultAddress})} defaultChecked={this.state.defaultAddress} /> Use address registered with this account</label>

                {address}

                <div className='text-right'><SubmitButton type='button' onClick={() => this.save()} loading={this.state.status === 'Loading'} value='Add Payment' /></div>

                <hr/>

                {paymentMethods}
            </section>
        );
    }
}

PaymentSettings.propTypes = {

};

export default injectStripe(PaymentSettings);