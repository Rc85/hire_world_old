import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LogError } from '../../utils/LogError';
import fetch from 'axios';
import InputWrapper from '../../utils/InputWrapper';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { CardNumberElement, CardCVCElement, CardExpiryElement, injectStripe, IbanElement } from 'react-stripe-elements';
import { connect } from 'react-redux';
import SubmitButton from '../../utils/SubmitButton';
import { Alert } from '../../../actions/AlertActions';
import FinancialAccountRow from './FinancialAccountRow';

class ConnectedSettingsForm extends Component {
    constructor(props) {
        super(props);

        this.routingNumber = '';
        this.branchNumber = '';
        
        this.state = {
            email: this.props.settings ? this.props.settings.email : null,
            external_accounts: this.props.settings ? this.props.settings.external_accounts : null,
            legal_entity: {
                type: this.props.settings ? this.props.settings.legal_entity.type : null,
                address: {
                    city: this.props.settings ? this.props.settings.legal_entity.address.city : null,
                    country: this.props.settings ? this.props.settings.legal_entity.address.country : null,
                    line1: this.props.settings ? this.props.settings.legal_entity.address.line1 : null,
                    line2: this.props.settings ? this.props.settings.legal_entity.address.line2 : null,
                    postal_code: this.props.settings ? this.props.settings.legal_entity.address.postal_code : null,
                    state: this.props.settings ? this.props.settings.legal_entity.address.state : null
                },
                dob: {
                    month: this.props.settings ? this.props.settings.legal_entity.dob.month : null,
                    day: this.props.settings ? this.props.settings.legal_entity.dob.day : null,
                    year: this.props.settings ? this.props.settings.legal_entity.dob.year : null
                },
                first_name: this.props.settings ? this.props.settings.legal_entity.first_name : null,
                last_name: this.props.settings ? this.props.settings.legal_entity.last_name : null,
                personal_id_number: this.props.settings ? this.props.settings.legal_entity.personal_id_number : null,
                phone_number: this.props.settings ? this.props.settings.legal_entity.phone_number : null
            },
            useDefault: true,
            accountType: '',
            accountHolder: '',
            accountNumber: '',
            accountRoutingNumber: '',
            accountCountry: '',
            accountCurrency: 'usd'
        }
    }
    
    setSettings(obj) {
        let settings = {...this.state, ...obj}

        this.setState(settings);
    }

    resetSettings() {
        this.setState({
            email: this.props.settings ? this.props.settings.email : null,
            legal_entity: {
                type: this.props.settings ? this.props.settings.legal_entity.type : null,
                address: {
                    city: this.props.settings ? this.props.settings.legal_entity.address.city : null,
                    country: this.props.settings ? this.props.settings.legal_entity.address.country : null,
                    line1: this.props.settings ? this.props.settings.legal_entity.address.line1 : null,
                    line2: this.props.settings ? this.props.settings.legal_entity.address.line2 : null,
                    postal_code: this.props.settings ? this.props.settings.legal_entity.address.postal_code : null,
                    state: this.props.settings ? this.props.settings.legal_entity.address.state : null
                },
                dob: {
                    month: this.props.settings ? this.props.settings.legal_entity.dob.month : null,
                    day: this.props.settings ? this.props.settings.legal_entity.dob.day : null,
                    year: this.props.settings ? this.props.settings.legal_entity.dob.year : null
                },
                first_name: this.props.settings ? this.props.settings.legal_entity.first_name : null,
                last_name: this.props.settings ? this.props.settings.legal_entity.last_name : null,
                personal_id_number: this.props.settings ? this.props.settings.legal_entity.personal_id_number : null,
                phone_number: this.props.settings ? this.props.settings.legal_entity.phone_number : null
            }
        });
    }

    setRoutingNumber(type, val) {
        if (type === 'routing') {
            this.routingNumber = val;
        } else if (type === 'branch') {
            this.branchNumber = val;
        }

        let newValue = this.routingNumber + this.branchNumber;

        this.setState({accountRoutingNumber: newValue});
    }

    async addFinancialAccount() {
        this.setState({status: 'Adding Financial Account'});

        let token;

        if (this.state.accountType === 'debit') {
            token = await this.props.stripe.createToken({
                name: this.state.accountHolder,
                currency: this.state.accountCurrency
            });
        } else if (this.state.accountType === 'bank') {
            if (['AT', 'BE', 'DK', 'FI', 'FR', 'DE', 'GI', 'IE', 'IT', 'LU', 'NL', 'NO', 'PT', 'ES', 'SE', 'CH'].indexOf(this.state.accountCountry) >= 0) {
                token = await this.props.stripe.createToken(iban, {
                    currency: this.state.accountCurrency,
                    account_holder_name: this.state.accountHolder
                });
            } else if (['AU', 'BR', 'CA', 'MX', 'HK', 'MX', 'NZ', 'US'].indexOf(this.state.accountCountry) >= 0) {
                token = await this.props.stripe.createToken('bank_account', {
                    country: this.state.accountCountry,
                    currency: this.state.accountCurrency,
                    routing_number: this.state.accountRoutingNumber,
                    account_number: this.state.accountNumber,
                    account_holder_name: this.state.accountHolder
                });
            } else if (this.state.accountCountry === 'GB') {
                if (this.state.ukBankType === 'bank_account') {
                    token = await this.props.stripe.createToken('bank account', {
                        country: this.state.accountCountry,
                        currency: this.state.accountCurrency,
                        routing_number: this.state.accountRoutingNumber,
                        account_number: this.state.accountNumber,
                        account_holder_name: this.state.accountHolder
                    });
                } else if (this.state.ukBankType === 'iban') {
                    token = await this.props.stripe.createToken(iban, {
                        currency: this.state.accountCurrency,
                        account_holder_name: this.state.accountHolder
                    });
                }
            }
        }

        fetch.post('/api/job/account/payment/add', token)
        .then(resp => {
            if (resp.data.status === 'success') {
                if (resp.data.status === 'success') {
                    let state = [...this.state.external_accounts.data];
                    state.unshift(resp.data.payment);
    
                    this.setSettings({external_accounts: {
                        ...this.state.external_accounts,
                        data: state
                    }});
                }
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            this.setState({status: ''});
        })
        .catch(err => {
            LogError(err, '/api/job/account/payment/add');
            this.setState({status: ''});
        });
    }

    async updatePersonal() {
        let state = {...this.state};

        this.setState({status: 'Updating Personal'});

        fetch.post('/api/job/account/update', state)
        .then(resp => {
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            this.setState({status: ''});
        })
        .catch(err => {
            LogError(err, '/api/job/account/update')
            this.setState({status: ''});
        });
    }

    setPaymentDefault(id, index) {
        this.setState({status: 'Setting Default'});

        fetch.post('/api/job/account/payment/default', {id: id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let state = [...this.state.external_accounts.data];

                for (let payment of state) {
                    payment.default_for_currency = false;
                }

                state[index] = resp.data.payment;

                this.setSettings({external_accounts: {
                    ...this.state.external_accounts,
                    data: state
                }});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            this.setState({status: ''});
        })
        .catch(err => {
            LogError(err, '/api/job/account/payment/default');
            this.setState({status: ''});
        });
    }

    deletePayment(id, index) {
        this.setState({status: 'Deleting Payment'});

        fetch.post('/api/job/account/payment/delete', {id: id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let state = [...this.state.external_accounts.data];
                state.splice(index, 1);

                this.setSettings({external_accounts: {
                    ...this.props.external_accounts,
                    data: state
                }});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            this.setState({status: ''});
        })
        .catch(err => LogError(err, '/api/job/account/payment/delete'));
    }
    
    render() {
        let supportedCountries = ['AT', 'AU', 'BE', 'CA', 'CH', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'LU', 'NL', 'NO', 'NZ', 'PT', 'SE', 'US'];
        let beginningYear = 1900;
        let currentYear = new Date().getFullYear();
        let yearsToAdd = parseInt(currentYear) - beginningYear - 19;
        let year = [];
        let ssn, financialForm;

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

        if (this.state.legal_entity.dob.month === 1 || this.state.legal_entity.dob.month === 3 || this.state.legal_entity.dob.month === 5 || this.state.legal_entity.dob.month === 7 || this.state.legal_entity.dob.month === 8 || this.state.legal_entity.dob.month === 10 || this.state.legal_entity.dob.month === 12) {
            numOfDays = 31;
        } else if (this.state.legal_entity.dob.month === 4 || this.state.legal_entity.dob.month === 6 || this.state.legal_entity.dob.month === 9 || this.state.legal_entity.dob.month === 11) {
            numOfDays = 30;
        } else if (this.state.legal_entity.dob.month === 2) {
            if (this.state.legal_entity.dob.year) {
                if (parseInt(this.state.legal_entity.dob.year) % 4 === 0) {
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

        if (this.state.accountType === 'debit') {
            financialForm = <div className='mb-3'>
                <div className='setting-field-container mb-3'>
                    <InputWrapper label='Account Holder Name' required>
                        <input type='text' onChange={(e) => this.setState({accountHolder: e.target.value})} />
                    </InputWrapper>
                </div>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child' required>
                        <InputWrapper label='Card Number' required className='pl-2 pb-2 pr-2'>
                            <CardNumberElement className='w-100' />
                        </InputWrapper>
                    </div>

                    <div className='setting-child one-third'>
                        <InputWrapper label='Expiry Date' required className='pl-2 pb-2 pr-2'>
                            <CardExpiryElement className='w-100' />
                        </InputWrapper>
                    </div>

                    <div className='setting-child one-third'>
                        <InputWrapper label='CVC' required className='pl-2 pb-2 pr-2'>
                            <CardCVCElement className='w-100' />
                        </InputWrapper>
                    </div>
                </div>

                <div className='text-right'>
                    <SubmitButton type='submit' loading={this.state.status === 'Adding Financial Account'} value='Add' />
                </div>
            </div>
        } else if (this.state.accountType === 'bank') {
            let bankInfo;

            if (this.state.accountCountry === 'CA') {
                bankInfo = <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Account Number' required>
                            <input type='number' onChange={(e) => this.setState({accountNumber: e.target.value})} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Transit Number' required>
                            <input type='number' onChange={(e) => this.setRoutingNumber('routing', e.target.value)} maxLength='5' />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Institution Number' required>
                            <input type='number' onChange={(e) => this.setRoutingNumber('branch', e.target.value)} maxLength='3' />
                        </InputWrapper>
                    </div>
                </div>;
            } else if (this.state.accountCountry === 'US') {
                bankInfo = <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Account Number' required>
                            <input type='number' onChange={(e) => this.setState({accountNumber: e.target.value})} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Routing Number' required>
                            <input type='number' onChange={(e) => this.setState({accountRoutingNumber: e.target.value})} maxLength='9' />
                        </InputWrapper>
                    </div>
                </div>;
            } else if (this.state.accountCountry === 'AU') {
                bankInfo = <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Account Number' required>
                            <input type='number' onChange={(e) => this.setState({accountNumber: e.target.value})} minLength='6' maxLength='10' />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='BSB' required>
                            <input type='number' onChange={(e) => this.setSettings({accountRoutingNumber: e.target.value})} maxLength='6' />
                        </InputWrapper>
                    </div>
                </div>;
            } else if (this.state.accountCountry === 'BR') {
                bankInfo = <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Account Number' required>
                            <input type='number' onChange={(e) => this.setState({accountNumber: e.target.value})} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Bank Code' required>
                            <input type='number' onChange={(e) => this.setRoutingNumber('routing', e.target.value)} maxLength='3' />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Branch Code' required>
                            <input type='number' onChange={(e) => this.setRoutingNumber('branch', e.target.value)} maxLength='4' />
                        </InputWrapper>
                    </div>
                </div>;
            } else if (this.state.accountCountry === 'HK') {
                bankInfo = <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Account Number' required>
                            <input type='number' onChange={(e) => this.setState({accountNumber: e.target.value})} minLength='6' maxLength='9' />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Clearing Code' required>
                            <input type='number' onChange={(e) => this.setRoutingNumber('routing', e.target.value)} maxLength='3' />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Branch Code' required>
                            <input type='number' onChange={(e) => this.setRoutingNumber('branch', e.target.value)} maxLength='3' />
                        </InputWrapper>
                    </div>
                </div>;
            } else if (this.state.accountCountry === 'MX') {
                bankInfo = <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Account Number (CLABE)' required>
                            <input type='number' onChange={(e) => this.setState({accountNumber: e.target.value})} maxLength='18' />
                        </InputWrapper>
                    </div>
                </div>;
            } else if (this.state.accountCountry === 'NZ') {
                bankInfo = <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Account Number' required>
                            <input type='number' onChange={(e) => this.setState({accountNumber: e.target.value})} minLength='15' maxLength='16' />
                        </InputWrapper>
                    </div>
                </div>;
            } else if (this.state.accountCountry === 'GB') {
                let bankType;

                if (this.state.ukBankType === 'bank') {
                    bankType = <div className='setting-field-container mb-3'>
                        <div className='setting-child'>
                            <InputWrapper label='Account Number' required>
                                <input type='number' onChange={(e) => this.setState({accountNumber: e.target.value})} maxLength='8' />
                            </InputWrapper>
                        </div>

                        <div className='setting-child quarte'>
                            <InputWrapper label='Sort Code' required>
                                <input type='number' onChange={(e) => this.setState({accountRoutingNumber: e.target.value})} maxLength='6' />
                            </InputWrapper>
                        </div>
                    </div>;
                } else if (this.state.ukBankType === 'iban') {
                    bankType = <InputWrapper label='IBAN' className='pr-2 pb-2 pl-2'>
                        <IbanElement className='w-100' supportedCountries={['SEPA']} />
                    </InputWrapper>;
                }
                bankInfo = <div>
                    <div className='mb-3'>The information required for UK-based bank accounts depends on the currency being used and the country of your Stripe account. EUR-denominated UK bank accounts and some countries that support UK-based GBP accounts may need to provide IBAN information instead of an account number and sort code.</div>

                    <div className='radio-container'>
                        <label className={this.state.ukBankType === 'bank' ? 'active' : ''}>
                            <div className='radio'>
                                {this.state.ukBankType === 'bank' ? <div className='radio-selected'></div> : ''}
                            </div>
                            <span>Bank Account</span>
                        </label>

                        <label className={this.state.ukBankType === 'iban' ? 'active' : ''}>
                            <div className='radio'>
                                {this.state.ukBankType === 'iban' ? <div className='radio-selected'></div> : ''}
                            </div>
                            <span>IBAN</span>
                        </label>
                    </div>

                    {bankType}
                </div>;
            } else if (['AT', 'BE', 'DK', 'FI', 'FR', 'DE', 'GI', 'IE', 'IT', 'LU', 'NL', 'NO', 'PT', 'ES', 'SE', 'CH'].indexOf(this.state.accountCountry) >= 0) {
                bankInfo = <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='IBAN' className='pr-2 pb-2 pl-2' required>
                            <IbanElement className='w-100' supportedCountries={['SEPA']} />
                        </InputWrapper>
                    </div>
                </div>;
            }

            let extSupportedCountries = [...supportedCountries, ...['BR', 'HK', 'MX']];

            financialForm = <div className='mb-3'>
                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Account Holder Name' required>
                            <input text='text' onChange={(e) => this.setState({accountHolder: e.target.value})} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Country' required>
                            <CountryDropdown value={this.state.accountCountry === null ? '' : this.state.accountCountry} onChange={(val) => this.setState({accountCountry: val})} valueType='short' whitelist={extSupportedCountries} />
                        </InputWrapper>
                    </div>
                </div>

                {bankInfo}

                <div className='text-right'>
                    <SubmitButton type='submit' loading={this.state.status === 'Adding Financial Account'} value='Add' />
                </div>
            </div>
        }

        return(
            <React.Fragment>
                <form onSubmit={(e) => {
                    e.preventDefault();
    
                    this.addFinancialAccount();                
                }}>
                    <div className='simple-container no-bg mb-3'>
                        <div className='simple-container-title'>Financial</div>
        
                        <div className='text-right mb-3'>
                            <button className='btn btn-info' type='button' onClick={() => this.setState({accountType: 'debit'})}>Add Debit Card</button>
                            <button className='btn btn-info' type='button' onClick={() => this.setState({accountType: 'bank'})}>Add Bank Account</button>
                        </div>
        
                        {financialForm}

                        {this.state.external_accounts ? <React.Fragment>
                            <hr/>

                            <div className='financial-accounts'>
                                {this.state.external_accounts.data.map((account, i) => {
                                    return <React.Fragment key={i}>
                                        <FinancialAccountRow account={account} setDefault={() => this.setPaymentDefault(account.id, i)} delete={() => this.deletePayment(account.id, i)} />

                                        {i + 1 !== this.state.external_accounts.data.length ? <hr /> : ''}
                                    </React.Fragment>;
                                })}
                            </div>
                        </React.Fragment> : ''}
                    </div>
                </form>
    
                <div className='simple-container no-bg mb-3'>
                    <form onSubmit={(e) => {
                        e.preventDefault();
        
                        this.updatePersonal();
                    }}>
                        <div className='radio-container mb-3'>
                            <label className={this.state.legal_entity.type === 'individual' ? 'active' : ''} onClick={() => this.setSettings({
                                legal_entity: {
                                    ...this.state.legal_entity,
                                    ...{type: 'individual'}
                                }
                            })}>
                                <div className='radio'>
                                    {this.state.legal_entity.type === 'individual' ? <div className='radio-selected'></div> : ''}
                                </div>
        
                                <span>Individual</span>
                            </label>
        
                            <label className={this.state.legal_entity.type === 'company' ? 'active' : ''} onClick={() => this.setSettings({
                                legal_entity: {
                                    ...this.state.legal_entity,
                                    ...{type: 'company'}
                                }
                            })}>
                                <div className='radio'>
                                    {this.state.legal_entity.type === 'company' ? <div className='radio-selected'></div> : ''}
                                </div>
        
                                <span>Company</span>
                            </label>
                        </div>

                        <div className='simple-container-title'>Personal Information</div>
    
                        <div className='setting-field-container mb-3'>
                            <InputWrapper label='First Name' required>
                                <input type='text' defaultValue={this.state.legal_entity.first_name === null ? '' : this.state.legal_entity.first_name} onChange={(e) => this.setSettings({
                                    legal_entity: {
                                        ...this.state.legal_entity,
                                        ...{first_name: e.target.value}
                                    }
                                })} />
                            </InputWrapper>
    
                            <InputWrapper label='Last Name' required>
                                <input type='text' defaultValue={this.state.legal_entity.last_name === null ? '' : this.state.legal_entity.last_name} onChange={(e) => this.setState({
                                    legal_entity: {
                                        ...this.state.legal_entity,
                                        ...{last_name: e.target.value}
                                    }
                                })} />
                            </InputWrapper>
                        </div>
    
                        <div className='setting-field-container mb-3'>
                            <InputWrapper label='Country' required>
                                <CountryDropdown value={this.state.legal_entity.address.country === null ? '' : this.state.legal_entity.address.country} onChange={(val) => this.setSettings({
                                    legal_entity: {
                                        ...this.state.legal_entity,
                                        ...{address: {
                                            ...this.state.legal_entity.address,
                                            ...{country: val}
                                            }
                                        }
                                    }
                                })} valueType='short' whitelist={supportedCountries} />
                            </InputWrapper>
    
                            <InputWrapper label='Region' required>
                                <RegionDropdown value={this.state.legal_entity.address.state === null ? '' : this.state.legal_entity.address.state} country={this.state.legal_entity.address.country} onChange={(val) => this.setSettings({
                                    legal_entity: {
                                        ...this.state.legal_entity,
                                        ...{address: {
                                            ...this.state.legal_entity.address,
                                            ...{state: val}
                                            }
                                        }
                                    }
                                })} countryValueType='short' valueType='short' />
                            </InputWrapper>
    
                            <InputWrapper label='City' required>
                                <input type='text' defaultValue={this.state.legal_entity.address.city === null ? '' : this.state.legal_entity.address.city} onChange={(e) => this.setSettings({
                                    legal_entity: {
                                        ...this.state.legal_entity,
                                        ...{address: {
                                            ...this.state.legal_entity.address,
                                            ...{city: e.target.value}
                                            }
                                        }
                                    }
                                })} />
                            </InputWrapper>
                        </div>
    
                        <div className='setting-field-container mb-3'>
                            <div className='setting-child three-quarter'>
                                <InputWrapper label='Address Line 1' required>
                                    <input type='text' defaultValue={this.state.legal_entity.address.line1 === null ? '' : this.state.legal_entity.address.line1} onChange={(e) => this.setSettings({
                                        legal_entity: {
                                            ...this.state.legal_entity,
                                            ...{address: {
                                                ...this.state.legal_entity.address,
                                                ...{line1: e.target.value}
                                                }
                                            }
                                        }
                                    })} />
                                </InputWrapper>
                            </div>
    
                            <div className='setting-child quarter'>
                                <InputWrapper label='Postal/Zip Code' required>
                                    <input type='text' defaultValue={this.state.legal_entity.address.postal_code === null ? '' : this.state.legal_entity.address.postal_code} onChange={(e) => this.setSettings({
                                        legal_entity: {
                                            ...this.state.legal_entity,
                                            ...{address: {
                                                ...this.state.legal_entity.address,
                                                ...{postal_code: e.target.value}
                                                }
                                            }
                                        }
                                    })} />
                                </InputWrapper>
                            </div>
                        </div>
    
                        <div className='setting-field-container mb-3'>
                            <InputWrapper label='Address Line 2'>
                                <input type='text' defaultValue={this.state.legal_entity.address.line2 === null ? '' : this.state.legal_entity.address.line2 === null} onChange={(e) => this.setSettings({
                                    legal_entity: {
                                        ...this.state.legal_entity,
                                        ...{address: {
                                            ...this.state.legal_entity.address,
                                            ...{line2: e.target.value}
                                            }
                                        }
                                    }
                                })} />
                            </InputWrapper>
                        </div>
    
                        <div className='setting-field-container mb-3'>
                            <InputWrapper label='Date of Birth' required>
                                <select value={this.state.legal_entity.dob.year === null ? '' : this.state.legal_entity.dob.year} onChange={(e) => this.setSettings({
                                    legal_entity: {
                                        ...this.state.legal_entity,
                                        ...{dob: {
                                            ...this.state.legal_entity.dob,
                                            ...{year: e.target.value}
                                            }
                                        }
                                    }
                                })}>
                                    <option value='' disabled>Year</option>
                                    {years.reverse()}
                                </select>
    
                                <select value={this.state.legal_entity.dob.month === null ? '' : this.state.legal_entity.dob.month} onChange={(e) => this.setSettings({
                                    legal_entity: {
                                        ...this.state.legal_entity,
                                        ...{dob: {
                                            ...this.state.legal_entity.dob,
                                            ...{month: e.target.value}
                                            }
                                        }
                                    }
                                })}>
                                    <option value='' disabled>Month</option>
                                    {months}
                                </select>
    
                                <select value={this.state.legal_entity.dob.day === null ? '' : this.state.legal_entity.dob.day} onChange={(e) => this.setSettings({
                                    legal_entity: {
                                        ...this.state.legal_entity,
                                        ...{dob: {
                                            ...this.state.legal_entity.dob,
                                            ...{day: e.target.value}
                                            }
                                        }
                                    }
                                })}>
                                    <option value='' disabled>Day</option>
                                    {days}
                                </select>
                            </InputWrapper>
    
                            <InputWrapper label='Phone Number'>
                                <input type='tel' defaultValue={this.state.legal_entity.phone_number === null ? '' : this.state.legal_entity.phone_number} onChange={(e) => this.setSettings({
                                    legal_entity: {
                                        ...this.state.legal_entity,
                                        ...{phone_number: e.target.value}
                                        }
                                    })} />
                            </InputWrapper>
    
                            <InputWrapper label='Email'>
                                <input type='email' defaultValue={this.state.email === null ? '' : this.state.email} onChange={(e) => this.setSettings({email: e.target.value})} />
                            </InputWrapper>
                        </div>

                        <div className='text-right'>
                            <SubmitButton type='submit' loading={this.state.status === 'Updating Personal'} value='Update' />
                            <button className='btn btn-secondary' onClick={() => this.resetSettings()}>Reset</button>
                        </div>
                    </form>
    
                    {/* <div className='simple-container no-bg mb-3'>
                        <div className='simple-container-title'>Business</div>
    
                        <div className='setting-field-container mb-3'>
                            <InputWrapper label='Business Name'>
                                <input type='text' defaultValue={this.state.business_name === null ? '' : this.state.business_name} onChange={(e) => this.setSettings({business_name: e.target.value})} />
                            </InputWrapper>
    
                            <InputWrapper label='Business Website'>
                                <input type='text' defaultValue={this.state.business_url === null ? '' : this.state.business_url} onChange={(e) => this.setSettings({business_url: e.target.value})} />
                            </InputWrapper>
                        </div>
    
                        <div className='setting-field-container mb-3'>
                            <InputWrapper label='Business ID Number'>
                                <input type='text' defaultValue={this.state.legal_entity.business_tax_id === null ? '' : this.state.legal_entity.business_tax_id} onChange={(e) => this.setSettings({
                                    legal_entity: {
                                        ...this.state.legal_entity,
                                        ...{business_tax_id: e.target.value}
                                        }
                                    })} />
                            </InputWrapper>
    
                            <InputWrapper label='Business VAT Number'>
                                <input type='text' defaultValue={this.state.legal_entity.business_vat_id === null ? '' : this.state.legal_entity.business_vat_id} onChange={(e) => this.setSettings({
                                    legal_entity: {
                                        ...this.state.legal_entity,
                                        ...{business_vat_id: e.target.value}
                                        }
                                    })} />
                            </InputWrapper>
                        </div>
                    </div> */}
                </div>
            </React.Fragment>
        )
    }
}

ConnectedSettingsForm.propTypes = {
    settings: PropTypes.object,
    user: PropTypes.object,
    update: PropTypes.func
};

export default connect()(injectStripe(ConnectedSettingsForm));