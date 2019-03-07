import React, { Component } from 'react';
import InputWrapper from '../utils/InputWrapper';
import Recaptcha from 'react-recaptcha';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import SubmitButton from '../utils/SubmitButton';
import fetch from 'axios';
import { Alert } from '../../actions/AlertActions';
import { LogError } from '../utils/LogError';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';

let onloadCallback = function() {
    return;
}
let recaptchaInstance;

class Register extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: ''
        }
    }

    register() {
        this.setState({status: 'Registering'});

        fetch.post('/api/auth/register', this.state)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: 'Registered'});
            } else if (resp.data.status === 'error') {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                recaptchaInstance.reset();
                this.setState({status: ''});
            }
        })
        .catch(err => {
            recaptchaInstance.reset();
            LogError(err, '/api/auth/register');
            this.setState({status: ''});
        });
    }

    verify(val) {
        this.setState({verified: val});
    }
    
    render() {
        if (this.props.user.status === 'success' && this.props.user.user) {
            return <Redirect to='/dashboard' />;
        }

        if (this.state.status === 'Registered') {
            return <Redirect to='/registration/success' />;
        }

        return (
            <section id='register' className='main-panel'>
                <TitledContainer title='Register' bgColor='success' shadow icon={<FontAwesomeIcon icon={faPlusSquare} />}>
                    <form onSubmit={(e) => {
                        e.preventDefault();

                        this.register();
                    }}>
                        <div className='setting-field-container mb-3'>
                            <InputWrapper label='First Name' required>
                                <input type='text' onChange={(e) => this.setState({firstName: e.target.value})} required maxLength='40' />
                            </InputWrapper>
    
                            <InputWrapper label='Last Name' required>
                                <input type='text' onChange={(e) => this.setState({lastName: e.target.value})} required maxLength='40' />
                            </InputWrapper>
                        </div>
    
                        <div className='setting-field-container mb-3'>
                            <InputWrapper label='Username' required>
                                <input type='text' onChange={(e) => this.setState({username: e.target.value})} required minLength='5' maxLength='25' placeholder='5 - 25 alphanumeric, dash, and underscore allowed' />
                            </InputWrapper>

                            <InputWrapper label='Profession Title' required>
                                <input type='text' onChange={(e) => this.setState({title: e.target.value})} required maxLength='40' placeholder='eg. - Auto Mechanic, Tutor, etc.' />
                            </InputWrapper>
                        </div>
    
                        <div className='setting-field-container mb-3' required>
                            <InputWrapper label='Password'>
                                <input type='password' onChange={(e) => this.setState({password: e.target.value})} required minLength='6' maxLength='20' />
                            </InputWrapper>
                            
                            <InputWrapper label='Confirm Password' required>
                                <input type='password' onChange={(e) => this.setState({confirmPassword: e.target.value})} required minLength='6' maxLength='20' />
                            </InputWrapper>
                        </div>
    
                        <div className='setting-field-container mb-3' required>
                            <InputWrapper label='Email'>
                                <input type='email' onChange={(e) => this.setState({email: e.target.value})} required />
                            </InputWrapper>
                            
                            <InputWrapper label='Confirm Email' required>
                                <input type='email' onChange={(e) => this.setState({confirmEmail: e.target.value})} required />
                            </InputWrapper>
                        </div>

                        <div className='setting-field-container mb-3'>
                            <div className='setting-child'>
                                <InputWrapper label='Country' required>
                                    <CountryDropdown value={this.state.country} onChange={(val) => this.setState({country: val})} valueType='short' />
                                </InputWrapper>
                            </div>

                            <div className='setting-child'>
                                <InputWrapper label='Region' required>
                                    <RegionDropdown value={this.state.region} country={this.state.country} onChange={(val) => this.setState({region: val})} countryValueType='short' valueType='short' />
                                </InputWrapper>
                            </div>

                            <div className='setting-child'>
                                <InputWrapper label='City' required>
                                    <input type='text' onChange={(e) => this.setState({city: e.target.value})} />
                                </InputWrapper>
                            </div>
                        </div>
    
                        <div className='mb-3'>
                            <label>
                                <input type='checkbox' onClick={() => this.setState({agreed: !this.state.agreed})} /> I have read, understood, and agree to the <a href='/tos'>Terms of Service</a> and <a href='/privacy'>Privacy Policy</a>
                            </label>
                        </div>
    
                        <Recaptcha sitekey='6LdKOIIUAAAAAPRGJ4dDSoHfb1Dad0vxuD4s5gjG' render='explicit' onloadCallback={onloadCallback} verifyCallback={(val) => this.verify(val)} ref={(el) => recaptchaInstance = el} />

                        <div className='text-right'>
                            <SubmitButton type='submit' loading={this.state.status === 'Registering'} />
                        </div>
                    </form>
                </TitledContainer>
            </section>
        );
    }
}

export default connect()(Register);