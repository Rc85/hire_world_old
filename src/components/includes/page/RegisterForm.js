import React, { Component } from 'react';
import SubmitButton from '../../utils/SubmitButton';
import { Alert } from '../../../actions/AlertActions';
import fetch from 'axios';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { connect } from 'react-redux';
import { LogError } from '../../utils/LogError';

class RegisterForm extends Component {
    constructor() {
        super();

        this.state = {
            username: null,
            password: null,
            confirmPassword: null,
            email: null,
            confirmEmail: null,
            firstName: null,
            lastName: null,
            country: undefined,
            region: undefined,
            city: null,
            accountType: 'User',
            agreed: false,
            legal: false,
            status: '',
            statusMessage: '',
            title: null,
            searchedTitles: []
        }
    }

    handleRegister() {
        this.setState({status: 'Registering'});

        fetch.post('/api/auth/register', this.state)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.callback(resp.data.status, resp.data.statusMessage);
            } else {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/auth/register'));
    }

    generateExpireYear() {
        let now = new Date();
        let year = now.getUTCFullYear();
        let years = [];
        
        for (let i = 0; i < 5; i++) {
            let expireYear = year + i;

            years.push(expireYear);
        }

        return years;
    }

    searchTitle(value) {
        if (value) {
            if (this.state.timeout) clearTimeout(this.state.timeout);

            this.setState({
                timeout: setTimeout(() => {
                    fetch.post('/api/user/search/titles', {value: value})
                    .then(resp => {
                        if (resp.data.status === 'success') {
                            this.setState({searchedTitles: resp.data.titles});
                        } else {
                            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                        }
                    })
                    .catch(err => LogError(err, '/api/user/search/titles'));
                }, 250)
            });
        }
    }

    render() {
        let status, payment;

        if (this.state.status && this.state.status !== 'Registering' && this.state.status !== 'success') {
            status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />
        } 

        /* if (this.state.accountType !== 'User') {
            payment = <div className='bordered-container rounded mb-3'>
                <div className='d-flex-between-center'>
                    <div><strong>Account Type:</strong> {this.state.accountType}</div>
                    <div><span className='reg-price-color'>{this.state.accountType === 'Listing' ? '$5' : '$10'}</span> / month</div>
                </div>

                <hr/>

                <div className='mb-3'>
                    <div><label htmlFor='cc-name'>Name on Card:</label></div>
                    <input type='text' name='cc_name' id='cc-name' required />
                </div>

                <div className='mb-3'>
                    <div><label htmlFor='cc-number'>Credit Card Number:</label></div>
                    <input type='text' name='cc_number' id='cc-number' minLength='16' maxLength='16' required />
                </div>

                <div className='d-flex-between-start mb-3'>
                    <div className='w-45'>
                        <div><label>Expiry Date:</label></div>
                        <div className='d-flex'>
                            <select name='cc_expire_month' id='cc-expire-month'className='mr-1' required>
                                <option value='01'>01</option>
                                <option value='02'>02</option>
                                <option value='03'>03</option>
                                <option value='04'>04</option>
                                <option value='05'>05</option>
                                <option value='06'>06</option>
                                <option value='07'>07</option>
                                <option value='08'>08</option>
                                <option value='09'>09</option>
                                <option value='10'>10</option>
                                <option value='11'>11</option>
                                <option value='12'>12</option>
                            </select>
    
                            <select name='cc_expire_year' id='cc-expire-year' required>
                                {this.generateExpireYear().map((year, i) => {
                                    return <option key={i} value={year}>{year}</option>
                                })}
                            </select>
                        </div>
                    </div>

                    <div className='w-45'>
                        <div><label htmlFor='cvc'>CVC:</label></div>
                        <input type='text' name='cvc' id='cvc' minLength='3' maxLength='3' required />
                    </div>
                </div>
            </div>
        } */

        let titles = this.state.searchedTitles.map((title, i) => {
            return <option key={i} value={title}>{title}</option>
        });

        return(
            <section id='register-form' className='main-panel'>
                <div className='blue-panel shallow rounded w-100'>
                    {status}
                    <div className='text-right'><small><em>All fields required</em></small></div>

                    <div className='mb-3'>
                        <label htmlFor='reg-username'>Username:</label>
                        <input type='text' name='username' id='reg-username' required onChange={(e) => this.setState({username: e.target.value})} placeholder='5-15 alpha-numeric, dash, and underscore' minLength='3' maxLength='15' />
                    </div>

                    <div className='mb-3'>
                        <label htmlFor='reg-title'>Profession Title:</label>
                        <input type='text' name='title' list='user-titles' id='reg-title' onKeyUp={(e) => this.searchTitle(e.target.value)} onChange={(e) => this.setState({title: e.target.value})} required autoComplete='off' />
                        <datalist id='user-titles'>
                            {titles}
                        </datalist>
                    </div>

                    <div className='d-flex-between-start mb-3'>
                        <div className='w-45'>
                            <div><label htmlFor='reg-fname'>First Name:</label></div>
                            <input type='text' name='fname' id='reg-fname' onChange={(e) => this.setState({firstName: e.target.value.charAt(0).toUpperCase() + e.target.value.substr(1)})} required maxLength='15' />
                        </div>

                        <div className='w-45'>
                            <div><label htmlFor='reg-lname'>Last Name:</label></div>
                            <input type='text' name='lname' id='reg-lname' onChange={(e) => this.setState({lastName: e.target.value.charAt(0).toUpperCase() + e.target.value.substr(1)})} required maxLength='15' />
                        </div>
                    </div>

                    <div className='d-flex-between-start mb-3'>
                        <div className='w-45'>
                            <div><label htmlFor='reg-password'>Password:</label></div>
                            <input type='password' name='password' id='reg-password' required onChange={(e) => this.setState({password: e.target.value})} placeholder='6-20 characters' minLength='6' maxLength='20' />
                        </div>

                        <div className='w-45'>
                            <div><label htmlFor='reg-confirm-password'>Confirm Password:</label></div>
                            <input type='password' name='confirm_password' id='reg-confirm-password' required onChange={(e) => this.setState({confirmPassword: e.target.value})} minLength='6' maxLength='20' autoComplete='off' />
                        </div>
                    </div>

                    <div className='d-flex-between-start mb-3'>
                        <div className='w-45'>
                            <div><label htmlFor='reg-email'>Email:</label></div>
                            <input type='email' name='email' id='reg-email' required onChange={(e) => this.setState({email: e.target.value})} />
                        </div>

                        <div className='w-45'>
                            <div><label htmlFor='reg-confirm-email'>Confirm Email:</label></div>
                            <input type='email' name='confirm_email' id='reg-confirm-email' required onChange={(e) => this.setState({confirmEmail: e.target.value})} autoComplete='off' />
                        </div>
                    </div>

                    <div className='mb-3'>
                        <label>Country:</label>
                        <CountryDropdown  value={this.state.country} onChange={(val) => {this.setState({country: val})}} />
                    </div>

                    <div className='mb-3'>
                        <label>Region:</label>
                        <RegionDropdown  value={this.state.region} country={this.state.country} onChange={(val) => this.setState({region: val})} />
                    </div>

                    <div className='mb-3'>
                        <label>City:</label>
                        <input type='text' name='city' onChange={(e) => this.setState({city: e.target.value})} defaultValue={this.state.city} />
                    </div>

                    {/* <div className='mb-3'>
                        <div className='d-flex-between-center'>
                            <label htmlFor='account-type'>Account Type:</label>
                            <NavLink to='/pricing'><small>Learn more</small></NavLink>
                        </div>

                        <div className='d-flex-between-start'>
                            <div className={this.state.accountType === 'User' ? 'reg-account-type active' : 'reg-account-type'} onClick={() => this.setState({accountType: 'User'})}>
                                User

                                {this.state.accountType === 'User' ? <FontAwesomeIcon icon={faCheck} /> : ''}
                            </div>

                            <div className={this.state.accountType === 'Listing' ? 'reg-account-type active' : 'reg-account-type'} onClick={() => this.setState({accountType: 'Listing'})}>
                                Listing

                                {this.state.accountType === 'Listing' ? <FontAwesomeIcon icon={faCheck} /> : ''}
                            </div>

                            <div className={this.state.accountType === 'Business' ? 'reg-account-type active' : 'reg-account-type'} onClick={() => this.setState({accountType: 'Business'})}>
                                Business

                                {this.state.accountType === 'Business' ? <FontAwesomeIcon icon={faCheck} /> : ''}
                            </div>
                        </div>
                    </div>

                    {payment} */}

                    <div className='mb-3'>
                        <div><input type='checkbox' name='agree' id='reg-agree' onClick={() => this.setState({agreed: !this.state.agreed})} /> <label className='form-check-label' htmlFor='reg-agree'>I have read and agree with the terms of service and privacy policy.</label></div>
                        <div><input type='checkbox' name='legal_age' id='legal-age' onClick={() => this.setState({legal: !this.state.legal})} /> <label htmlFor='legal-age' className='form-check-label'>I acknowledge that I am 18 years of age or older.</label></div>
                    </div>
                    

                    <div className='text-right'>
                        {/* <button className='btn btn-primary' onClick={() => this.handleRegister()}>Submit</button> */}
                        <SubmitButton type='submit' loading={this.state.status === 'Registering' ? true : false} value='Submit' onClick={() => this.handleRegister()}/>

                        <button className='btn btn-secondary' disabled={this.props.status === 'loading' ? true : false} onClick={() => {
                            this.setState({
                                username: null,
                                password: null,
                                confirmPassword: null,
                                email: null,
                                confirmEmail: null
                            });
                        }}>
                            Clear
                        </button>
                    </div>
                </div>
            </section>
        )
    }
}

export default connect()(RegisterForm);