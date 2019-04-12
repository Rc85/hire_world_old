import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import InputWrapper from '../utils/InputWrapper';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import SubmitButton from '../utils/SubmitButton';
import Recaptcha from 'react-recaptcha';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import { Alert } from '../../actions/AlertActions';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { CardNumberElement, CardCVCElement, CardExpiryElement, injectStripe, IbanElement } from 'react-stripe-elements';
import ConnectedSettingsForm from '../includes/page/ConnectedSettingsForm';

let onloadCallback = function() {
    console.log('Recaptcha ready!');
}

let recaptchaInstance;

class NotConnected extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            business_type: null,
            business_profile: {
                name: null,
                product_description: null,
            },
            email: null,
            external_accounts: null,
            individual: {
                address: {
                    city: null,
                    country: null,
                    line1: null,
                    line2: null,
                    postal_code: null,
                    state: null
                },
                dob: {
                    month: null,
                    day: null,
                    year: null
                },
                first_name: null,
                last_name: null,
                id_number: null,
                phone_number: null,
                verification: {
                    status: null
                }
            },
            company: {
                name: null,
                address: {
                    city: null,
                    country: null,
                    line1: null,
                    line2: null,
                    postal_code: null,
                    state: null
                },
                tax_id: null,
                phone: null,
            },
            ukBankType: '',
            useDefault: true,
            accountType: '',
            accountHolder: '',
            accountNumber: '',
            accountRoutingNumber: '',
            accountCountry: '',
            accountCurrency: 'usd',
            tosAgree: false,
            stripeAgree: false,
            verified: false,
            useDefault: false,
            status: ''
        }
    }

    submit() {
        this.setState({status: 'Submitting'});

        fetch.post('/api/job/accounts/create', this.state)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: 'Account Created'});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                recaptchaInstance.reset();
            }
        })
        .catch(err => {
            LogError(err, '/api/job/account/create');
            recaptchaInstance.reset();
            this.setState({status: ''});
        });
    }

    verify(response) {
        this.setState({verified: response});
    }

    useDefault() {
        if (!this.state.useDefault) {
            this.setState({
                useDefault: true,
                firstname: this.props.user.user.user_firstname,
                lastname: this.props.user.user.user_lastname,
                country: this.props.user.user.user_country,
                region: this.props.user.user.user_region,
                city: this.props.user.user.user_city,
                address: this.props.user.user.user_address,
                cityCode: this.props.user.user.user_city_code,
                businessName: this.props.user.user.user_business_name
            });
        } else {
            this.setState({
                useDefault: false,
                firstname: null,
                lastname: null,
                country: null,
                region: null,
                city: null,
                address: null,
                cityCode: null,
                businessName: null
            });
        }
    }
    
    render() {
        if (this.state.status === 'Account Created') {
            return <Redirect to='/account/created' />;
        }
        
        return(
            <div id='jobs-not-connected' className='main-panel'>
                <TitledContainer title='Not Connected' icon={<FontAwesomeIcon icon={faTimesCircle} />} shadow>
                    <div className='mb-3'>
                        <div className='mb-3'>To begin working with other users on our platform, you need a Connected account. To create an account, please fill out the form below.</div>

                        <div className='mb-3'>A new account will undergo a review process by Hire World, this should not take more than 24 hours. At the same time, your account will not be verified by Stripe Connect until a bank account and further required information is provided. After creating your account, you can check your status, add and change information in <strong>Connected Settings</strong>.</div>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();

                            this.submit();
                        }}>
                            <ConnectedSettingsForm settings={this.state} set={(state) => this.setState(state)} />
                            
                            <div className='terms mb-3'>
                                Payment processing services for working with other users on Hire World (collectively, <strong>"us"</strong>, <strong>"we"</strong>, <strong>"our"</strong>) are provided by Stripe and are subject to the <a href='https://stripe.com/connect-account/legal'>Stripe Connected Account Agreement</a>, which includes the <a href='https://stripe.com/legal'>Stripe Terms of Service</a> (collectively, the <strong>“Stripe Services Agreement”</strong>). By agreeing to these terms or continuing to work with other users on Hire World, you agree to be bound by the Stripe Services Agreement, as the same may be modified by Stripe from time to time. As a condition of Hire World enabling payment processing services through Stripe, you agree to provide us with accurate and complete information about you and your business, and you authorize us to share it and transaction information related to your use of the payment processing services provided by Stripe.
                            </div>

                            <div className='mb-3'>
                                <div><label><input type='checkbox' checked={this.state.tosAgree} onChange={() => this.setState({tosAgree: !this.state.tosAgree})} /> I understand and agree with the terms indicated above.</label></div>
                                <div><label><input type='checkbox' checked={this.state.stripeAgree} onChange={() => this.setState({stripeAgree: !this.state.stripeAgree})} /> I have read, understood, and agreed to <a href='https://stripe.com/connect-account/legal'>Stripe Connected Account Agreement</a> and <a href='https://stripe.com/legal'>Stripe Terms of Service</a>.</label></div>
                            </div>

                            <div className='d-flex-between-center'>
                                <Recaptcha sitekey='6Lev95EUAAAAAD6Ox0SOCyKyqQgCW7LA8d3f0DDa' render='explicit' onloadCallback={onloadCallback} verifyCallback={(val) => this.verify(val)} ref={(e) => recaptchaInstance = e} />

                                <SubmitButton type='submit' loading={this.state.status === 'Submitting'} />
                            </div>
                        </form>
                    </div>
                </TitledContainer>
            </div>
        )
    }
}

NotConnected.propTypes = {
    
};

export default connect()(injectStripe(NotConnected));