import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CardNumberElement, CardCVCElement, CardExpiryElement, injectStripe } from 'react-stripe-elements';
import SubmitButton from '../utils/SubmitButton';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import { Alert } from '../../actions/AlertActions';
import PaymentMethods from '../includes/page/PaymentMethods';
import AddressInput from '../includes/page/AddressInput';
import { connect } from 'react-redux';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard } from '@fortawesome/free-regular-svg-icons';
import InputWrapper from '../utils/InputWrapper';

class PaymentSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            defaultAddress: null,
            saveAddress: false,
            payments: []
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.user.user !== this.props.user.user) {
            this.setState({
                defaultAddress: this.props.user.user.user_address && this.props.user.user.user_city && this.props.user.user.user_region && this.props.user.user.user_country && this.props.user.user.user_city_code ? true : false
            });
        }
    }
    
    componentDidMount() {
        let defaultAddress = false;

        if (this.props.user.user && this.props.user.user.user_address && this.props.user.user.user_city && this.props.user.user.user_region && this.props.user.user.user_country && this.props.user.user.user_city_code) {
            defaultAddress = true;
        }

        fetch.post('/api/get/payments')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', payments: resp.data.payments, defaultSource: resp.data.defaultSource, defaultAddress: defaultAddress});
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
                this.cardName.clear();
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
        if (!this.props.user.user.user_address && !this.props.user.user.user_city && !this.props.user.user.user_region && !this.props.user.user.user_country && !this.props.user.user.user_city_code) {
            this.props.dispatch(Alert('error', 'No address to use'));
        } else {
            this.setState({defaultAddress: !this.state.defaultAddress});
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
            <section id='payment-settings' className='main-panel'>
                <TitledContainer title='Payment Settings' bgColor='green' icon={<FontAwesomeIcon icon={faCreditCard} />}>
                    <div className='setting-child payment-icons'>
                        <img src='/images/powered_by_stripe.png' className='payment-icon mr-1' />
                        <img src='/images/payment_methods.png' className='payment-icon' />
                    </div>

                    <div className='mobile-tooltip mb-3'>Your name on your profile will be used if left blank</div>
    
                    <div className='setting-child mb-3'>
                        <InputWrapper label='Name on Card'>
                            <input type='text' name='name' id='nameOnCard' onChange={(e) => this.setState({name: e.target.value})} placeholder={this.props.config.isTyping ? '' : 'Your name on your profile will be used if left blank'} ref={el => this.cardName = el} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                        </InputWrapper>
                    </div>
    
                    <div className='setting-field-container mb-3'>
                        <div className='setting-child three-quarter'>
                            <InputWrapper label='Card Number'><CardNumberElement onReady={el => this.CardNumberElement = el} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} className='w-100' /></InputWrapper>
                        </div>

                        <div className='setting-child quarter'>
                            <InputWrapper label='Expiry Date'><CardExpiryElement onReady={el => this.CardExpiryElement = el} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} className='w-100' /></InputWrapper>
                        </div>
    
                        <div className='setting-child quarter'>
                            <InputWrapper label='CVC'><CardCVCElement onReady={el => this.CardCVCElement = el} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} className='w-100' /></InputWrapper>
                        </div>
                    </div>
    
                    <div className='setting-child mb-3'><label><input type='checkbox' name='default-address' id='useDefaultAddress' onClick={() => this.useDefaultAdress()} defaultChecked={this.state.defaultAddress} /> Use address registered with this account</label></div>
    
                    {address}
    
                    <div className='text-right'><SubmitButton type='button' onClick={() => this.save()} loading={this.state.status === 'Adding'} value='Add Payment' /></div>
    
                    <hr/>
    
                    {paymentMethods}
                </TitledContainer>
            </section>
        )
    }
}

PaymentSettings.propTypes = {
    user: PropTypes.object
};

const mapStateToProps = state => {
    return {
        config: state.Config
    }
}

export default connect(mapStateToProps)(injectStripe(PaymentSettings));