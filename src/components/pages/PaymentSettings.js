import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CardNumberElement, CardCVCElement, CardExpiryElement, injectStripe } from 'react-stripe-elements';
import { Redirect } from 'react-router-dom';
import SubmitButton from '../utils/SubmitButton';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import { Alert } from '../../actions/AlertActions';
import PaymentMethods from '../includes/page/PaymentMethods';
import AddressInput from '../includes/page/AddressInput';
import { connect } from 'react-redux';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard } from '@fortawesome/pro-regular-svg-icons';
import InputWrapper from '../utils/InputWrapper';
import Loading from '../utils/Loading';
import { IsTyping } from '../../actions/ConfigActions';
import { CountryDropdown } from 'react-country-region-selector';
import AddBankAccount from '../includes/page/AddBankAccount';

class PaymentSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            defaultAddress: this.props.user.user && this.props.user.user.user_address && this.props.user.user.user_city && this.props.user.user.user_region && this.props.user.user.user_country && this.props.user.user.user_city_code,
            saveAddress: false,
            payments: [],
            name: '',
            type: 'card',
            accountBranchNumber: '',
            accountHolder: '',
            accountCountry: '',
            accountNumber: '',
            accountRoutingNumber: ''
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.user.user && this.props.user.user && prevProps.user.user !== this.props.user.user) {
            this.setState({
                defaultAddress: this.props.user.user.user_address && this.props.user.user.user_city && this.props.user.user.user_region && this.props.user.user.user_country && this.props.user.user.user_city_code ? true : false
            });
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/user/payments')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', payments: resp.data.payments, defaultSource: resp.data.defaultSource});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            LogError(err, '/api/get/user/payments');
            this.setState({status: ''});
        });
    }
    
    async save() {
        this.setState({status: 'Adding'});

        let token = await this.props.stripe.createToken({
            name: this.state.name ? this.state.name : `${this.props.user.user.user_firstname} ${this.props.user.user.user_lastname}`,
            address_line1: this.state.defaultAddress ? this.props.user.user.user_address : this.state.address_line1,
            address_city: this.state.defaultAddress ? this.props.user.user.user_city : this.state.address_city,
            address_state: this.state.defaultAddress ? this.props.user.user.user_region : this.state.address_state,
            address_zip: this.state.defaultAddress ? this.props.user.user.user_city_code : this.state.address_zip,
            address_country: this.state.defaultAddress ? this.props.user.user.user_country : this.state.address_country
        });

        let data = {...this.state.defaultAddress, ...this.state.saveAddress, ...token};

        fetch.post('/api/user/payment/add', data)
        .then(resp => {
            if (resp.data.status === 'success') {
                let payments = [...this.state.payments];
                payments.push(resp.data.card);

                this.CardExpiryElement.clear();
                this.CardNumberElement.clear();
                this.CardCVCElement.clear();
                this.setState({status: '', name: '', address_line1: '', address_country: '', address_city: '', address_state: '', address_zip: '', payments: payments, defaultSource: resp.data.defaultSource});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/user/payment/add'));
    }

    clear() {
        this.CardExpiryElement.clear();
        this.CardNumberElement.clear();
        this.CardCVCElement.clear(); 
        this.setState({status: '', name: '', address_line1: '', address_country: '', address_city: '', address_state: '', address_zip: ''});
    }

    set(key, val) {
        let obj = {};
        obj[key] = val;

        this.setState(obj);
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

    edit(data, index) {
        this.setState({status: 'Editing'});

         fetch.post('/api/user/payment/edit', data)
        .then(resp => {
            let payments = [...this.state.payments];

            if (resp.data.status === 'success') {
                payments[index] = resp.data.card;
            }

            this.setState({status: '', payments: payments});
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/user/payment/edit'));
    }

    setRoutingNumber(type, val) {
        if (type === 'branch') {
            this.setState({accountBranchNumber: val});
        } else if (type === 'routing') {
            this.setState({accountRoutingNumber: val});
        }
    }
    
    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/' />;
        }

        if (this.props.user.user) {
            let address, paymentMethods, paymentType;

            if (!this.state.defaultAddress) {
                address = <AddressInput saveable={true} info={this.state} set={(key, val) => this.set(key, val)} />;
            }

            if (this.state.payments.length > 0) {
                paymentMethods = this.state.payments.map((payment, i) => {
                    return <PaymentMethods key={i} status={this.state.status} payment={payment} defaultSource={this.state.defaultSource} save={(data) => this.edit(data, i)} setDefault={(id) => this.setDefault(id)} delete={(id) => this.delete(i, id)} />;
                });
            }

            let supportedCountries = ['AU', 'AT', 'BE', 'BR', 'CA', 'DK', 'FI', 'FR', 'DE', 'GI', 'HK', 'IE', 'IT', 'LU', 'MX', 'NL', 'NZ', 'NO', 'PT', 'ES', 'SE', 'CH', 'GB', 'US'];

            if (this.state.type === 'card') {
                paymentType = <React.Fragment>
                    <div className='payment-icons'>
                        <img src='/images/powered_by_stripe.png' className='payment-icon mr-1' />
                        <img src='/images/payment_methods.png' className='payment-icon' />
                    </div>

                    <div className='mobile-tooltip mb-3'>Your name on your profile will be used if left blank</div>
                    
                    <InputWrapper label='Name on Card' className='mb-3' required>
                        <input type='text' name='name' id='nameOnCard' onChange={(e) => this.setState({name: e.target.value})} placeholder={this.props.config.IsTyping ? '' : 'Your name on your profile will be used if left blank'} value={this.state.name} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>

                    <div className='setting-field-container mb-3'>
                        <div className='setting-child three-quarter'>
                            <InputWrapper label='Card Number' required className='pl-1 pb-1 pr-1'><CardNumberElement onReady={el => this.CardNumberElement = el} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} className='w-100' /></InputWrapper>
                        </div>

                        <div className='setting-child quarter'>
                            <InputWrapper label='Expiry Date' required className='pl-1 pb-1 pr-1'><CardExpiryElement onReady={el => this.CardExpiryElement = el} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} className='w-100' /></InputWrapper>
                        </div>

                        <div className='setting-child quarter'>
                            <InputWrapper label='CVC' required className='pl-1 pb-1 pr-1'><CardCVCElement onReady={el => this.CardCVCElement = el} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} className='w-100' /></InputWrapper>
                        </div>
                    </div>
                </React.Fragment>;
            } else if (this.state.type === 'bank') {
                paymentType = <AddBankAccount
                accountCountry={this.state.accountCountry}
                setCountry={(val) => this.setState({accountCountry: val})}
                setAccountNumber={(val) => this.setState({accountNumber: val})}
                setRoutingNumber={(type, val) => this.setRoutingNumber(type, val)}
                setAccountHolder={(val) => this.setState({accountHolder: val})}
                supportedCountries={supportedCountries}
                status={this.state.status} />;
            }

            return (
                <section id='payment-settings' className='main-panel'>
                    <TitledContainer title='Payment Settings' bgColor='green' icon={<FontAwesomeIcon icon={faCreditCard} />} shadow>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            this.save();
                        }}>
                            {paymentType}
            
                            <div className='setting-child mb-3'><label><input type='checkbox' name='default-address' id='useDefaultAddress' onClick={() => this.useDefaultAdress()} defaultChecked={this.state.defaultAddress} /> Use address registered with this account</label></div>
            
                            {address}
            
                            <div className='text-right'>
                                <SubmitButton type='submit' loading={this.state.status === 'Adding'} value='Add Payment' />
                                <button type='button' className='btn btn-secondary' onClick={() => this.clear()}>Clear</button>
                            </div>
                        </form>
        
                        <hr/>
        
                        {paymentMethods}
                    </TitledContainer>
                </section>
            )
        }
        
        return <Loading size='7x' color='black' />;
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