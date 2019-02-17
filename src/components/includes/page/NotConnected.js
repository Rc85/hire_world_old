import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import InputWrapper from '../../utils/InputWrapper';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import SubmitButton from '../../utils/SubmitButton';
import Recaptcha from 'react-recaptcha';
import fetch from 'axios';
import { LogError } from '../../utils/LogError';

var onloadCallback = function() {
    console.log('Recaptcha ready!');
}

class NotConnected extends Component {
    constructor(props) {
        super(props);

        console.log(this.props);
        
        this.state = {
            firstname: this.props.user.user.user_firstname,
            lastname: this.props.user.user.user_lastname,
            dobMonth: '',
            dobDay: '',
            dobYear: '',
            country: this.props.user.user.user_country,
            region: this.props.user.user.user_region,
            city: this.props.user.user.user_city || '',
            address: this.props.user.user.user_address || '',
            cityCode: this.props.user.user.user_city_code || '',
            tosAgree: false,
            stripeAgree: false,
            verified: false
        }
    }

    submit() {
        this.setState({status: 'Submitting'});

        fetch.post('/api/job/accounts/create', this.state)
        .then(resp => {
            this.setState({status: ''});
        })
        .catch(err => {
            this.setState({status: ''});
            LogError(err, '/api/job/account/create');
        });
    }

    verify(response) {
        this.setState({verified: response});
    }
    
    render() {
        (this.state);
        let supportedCountries = ['AT', 'AU', 'BE', 'CA', 'CH', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'LU', 'NL', 'NO', 'NZ', 'PT', 'SE', 'US'];

        if (supportedCountries.indexOf(this.props.user.user.user_country) >= 0) {
            let beginningYear = 1900;
            let currentYear = new Date().getFullYear();
            let yearsToAdd = parseInt(currentYear) - beginningYear - 19;
            let year = [];
            let ssn;

            for (let i = 0; i < yearsToAdd; i++) {
                let y = beginningYear + i;
                year.push(y);
            }

            let years = year.map((y, i) => {
                return <option key={i} value={y}>{y}</option>
            });

            let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            let months = month.map((m, i) => {
                return <option key={i} value={i + 1}>{m}</option>
            });

            let day = [];
            let numOfDays = 0;

            if (this.state.dobMonth === '1' || this.state.dobMonth === '3' || this.state.dobMonth === '5' || this.state.dobMonth === '7' || this.state.dobMonth === '8' || this.state.dobMonth === '10' || this.state.dobMonth === '12') {
                numOfDays = 31;
            } else if (this.state.dobMonth === '4' || this.state.dobMonth === '6' || this.state.dobMonth === '9' || this.state.dobMonth === '11') {
                numOfDays = 30;
            } else if (this.state.dobMonth === '2') {
                if (this.state.dobYear) {
                    if (parseInt(this.state.dobYear) % 4 === 0) {
                        numOfDays = 29;
                    } else {
                        numOfDays = 28;
                    }
                }
            }

            for (let i = 0; i < numOfDays; i++) {
                day.push(i + 1);
            }

            let days = day.map((d, i) => {
                return <option key={i} value={d}>{d}</option>
            });

            if (this.state.country === 'US') {
                ssn = <div className='setting-field-container quarter'>
                    <InputWrapper label='Social Security Number'>
                        <input type='number' maxLength='4' placeholder='Last 4 digits' onChange={(e) => this.setState({ssn: e.target.value})} />
                    </InputWrapper>
                </div>;
            } else if (this.state.country === 'CA') {
                ssn = <div className='setting-field-container quarter'>
                    <InputWrapper label='Social Insurance Number'>
                        <input type='number' maxLength='9' onChange={(e) => this.setState({ssn: e.target.value})} />
                    </InputWrapper>
                </div>;
            }
            
            return(
                <div id='jobs-not-connected' className='main-panel'>
                    <TitledContainer title='Not Connected' icon={<FontAwesomeIcon icon={faTimesCircle} />} shadow>
                        <div className='mb-3'>
                            <div className='mb-3'>To begin working with other users on HireWorld, you need a Stripe Connected account connected to our platform. To create an account, please fill out the form below. Your country, once set, cannot be updated. For everything else, you can update it later as you wish.</div>

                            <div className='mb-3'>Please note that this form provides only some of the fields required to verified your identity and that your Connected account may not be verified immediately.</div>

                            <div className='mb-3'>Once an account is created, you can update your information in the Settings page.</div>
                            
                            <form onSubmit={(e) => {
                                e.preventDefault();

                                this.submit();
                            }}>
                                <div className='setting-field-container mb-3'>
                                    <InputWrapper label='First Name' required>
                                        <input type='text' onChange={(e) => this.setState({firstname: e.target.value})} />
                                    </InputWrapper>

                                    <InputWrapper label='Last Name' required>
                                        <input type='text' onChange={(e) => this.setState({lastname: e.target.value})} />
                                    </InputWrapper>
                                </div>

                                <div className='setting-field-container mb-3'>
                                    <InputWrapper label='Country' required>
                                        <CountryDropdown value={this.state.country} onChange={(val) => this.setState({country: val})} valueType='short' whitelist={supportedCountries} />
                                    </InputWrapper>

                                    <InputWrapper label='Region' required>
                                        <RegionDropdown value={this.state.region} country={this.state.country} onChange={(val) => this.setState({region: val})} countryValueType='short' valueType='short'  />
                                    </InputWrapper>

                                    <InputWrapper label='City' required>
                                        <input type='text' value={this.state.city} onChange={(e) => this.setState({city: e.target.value})} />
                                    </InputWrapper>
                                </div>
                                
                                <div className='setting-field-container mb-3'>
                                    <div className='setting-field-container'>
                                        <InputWrapper label='Date of Birth' required>
                                            <select value={this.state.dobYear} onChange={(e) => this.setState({dobYear: e.target.value})}>
                                                <option value='' disabled>Year</option>
                                                {years.reverse()}
                                            </select>

                                            <select value={this.state.dobMonth} onChange={(e) => this.setState({dobMonth: e.target.value})}>
                                                <option value='' disabled>Month</option>
                                                {months}
                                            </select>

                                            <select value={this.state.dobDay} onChange={(e) => this.setState({dobDay: e.target.value})}>
                                                <option value='' disabled>Day</option>
                                                {days}
                                            </select>
                                        </InputWrapper>
                                    </div>

                                    {ssn}
                                </div>

                                <div className='setting-field-container mb-3'>
                                    <div className='setting-child three-quarter'>
                                        <InputWrapper label='Address' required>
                                            <input type='text' onChange={(e) => this.setState({address: e.target.value})} />
                                        </InputWrapper>
                                    </div>

                                    <div className='setting-child quarter'>
                                        <InputWrapper label='Postal/Zip Code' required>
                                            <input type='text' onChange={(e) => this.setState({cityCode: e.target.value})} />
                                        </InputWrapper>
                                    </div>
                                </div>
                                
                                <div className='terms mb-3'>
                                    Payment processing services for working with other users on HireWorld (collectively, <strong>"us"</strong>, <strong>"we"</strong>, <strong>"our"</strong>) are provided by Stripe and are subject to the <a href='https://stripe.com/connect-account/legal'>Stripe Connected Account Agreement</a>, which includes the <a href='https://stripe.com/legal'>Stripe Terms of Service</a> (collectively, the <strong>“Stripe Services Agreement”</strong>). By agreeing to these terms or continuing to work with other users on HireWorld, you agree to be bound by the Stripe Services Agreement, as the same may be modified by Stripe from time to time. As a condition of HireWorld enabling payment processing services through Stripe, you agree to provide us with accurate and complete information about you and your business, and you authorize us to share it and transaction information related to your use of the payment processing services provided by Stripe.
                                </div>

                                <div className='mb-3'>
                                    <div><label><input type='checkbox' checked={this.state.tosAgree} onChange={() => this.setState({tosAgree: !this.state.tosAgree})} /> I understand and agree with the terms indicated above.</label></div>
                                    <div><label><input type='checkbox' checked={this.state.stripeAgree} onChange={() => this.setState({stripeAgree: !this.state.stripeAgree})} /> I have read, understood, and agreed to <a href='https://stripe.com/connect-account/legal'>Stripe Connected Account Agreement</a> and <a href='https://stripe.com/legal'>Stripe Terms of Service</a>.</label></div>
                                </div>

                                <div className='d-flex-between-center'>
                                    <Recaptcha sitekey='6Lev95EUAAAAAD6Ox0SOCyKyqQgCW7LA8d3f0DDa' render='explicit' onloadCallback={onloadCallback} verifyCallback={(val) => this.verify(val)} />

                                    <SubmitButton type='submit' loading={this.state.status === 'Submitting'} />
                                </div>
                            </form>
                        </div>
                    </TitledContainer>
                </div>
            )
        } else {
            return(
                <div id='jobs-not-connected' className='main-panel'>
                    <TitledContainer title='Not Supported' icon={<FontAwesomeIcon icon={faTimesCircle} />} shadow>
                        <div className='text-center'>
                            <h2 className='mb-5'>We're Sorry!</h2>
                            <span>We regret to inform you that the country you currently reside in is not supported by Stripe Connect. If you would like to be notified when your country is supported, you can join Stripe's mailing list <a href='https://stripe.com/global'>here</a>.</span>
                        </div>
                    </TitledContainer>
                </div>
            )
        }
    }
}

NotConnected.propTypes = {
    
};

export default NotConnected;