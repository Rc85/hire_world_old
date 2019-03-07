import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LogError } from '../utils/LogError';
import fetch from 'axios';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faPlus, faCreditCard, faUniversity } from '@fortawesome/free-solid-svg-icons';
import Loading from '../utils/Loading';
import ConnectedSettingsForm from '../includes/page/ConnectedSettingsForm';
import NotConnected from '../includes/page/NotConnected';
import { connect } from 'react-redux';
import { Alert } from '../../actions/AlertActions';
import { CardNumberElement, CardCVCElement, CardExpiryElement, injectStripe, IbanElement } from 'react-stripe-elements';
import FinancialAccountRow from '../includes/page/FinancialAccountRow';
import SubmitButton from '../utils/SubmitButton';
import InputWrapper from '../utils/InputWrapper';

class ConnectedSettings extends Component {
    constructor(props) {
        super(props);

        this.routingNumber = '';
        this.branchNumber = '';
        
        this.state = {
            status: '',
            statusMessage: '',
            user: {},
            business_type: null,
            business_profile: {
                business_name: null,
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
                personal_id_number: null,
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
                phone: null
            },
            ukBankType: '',
            useDefault: true,
            accountType: '',
            accountHolder: '',
            accountNumber: '',
            accountRoutingNumber: '',
            accountCountry: '',
            accountCurrency: 'usd'
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Fetching'});

        fetch.post('/api/job/accounts/fetch')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', ...resp.data.account, user: resp.data.user});
            } else if (resp.data.status === 'error' && resp.data.statusMessage === `You're not logged in`) {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            LogError(err, '/api/job/accounts/fetch');
            this.setState({status: ''});
        });
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
                    let state = {...this.state};
                    state.external_accounts.data.unshift(resp.data.payment);
    
                    this.setState(state);
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

    setRoutingNumber(type, val) {
        if (type === 'routing') {
            this.routingNumber = val;
        } else if (type === 'branch') {
            this.branchNumber = val;
        }

        let newValue = this.routingNumber + this.branchNumber;

        this.setState({accountRoutingNumber: newValue});
    }

    updatePersonal() {
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
                let state = {...this.state};

                for (let payment of state.external_accounts.data) {
                    payment.default_for_currency = false;
                }

                state.external_accounts.data[index] = resp.data.payment;

                this.setState(state);
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
            let state = {...this.state};

            if (resp.data.status === 'success') {
                state.external_accounts.data.splice(index, 1);
            }

            state.status = '';
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            this.setState(state);
        })
        .catch(err => {
            LogError(err, '/api/job/account/payment/delete');
            this.setState({status: ''});
        });
    }
    
    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        }

        if (this.props.user.user) {
            if (!this.props.user.user.connected_id) {
                return <NotConnected user={this.props.user} />;
            }

            let verificationStatus, status, reviewStatus, financialForm;

            if (this.state.status === 'Fetching') {
                status = <Loading size='5x' />;
            }

            if (this.state.user) {
                if (this.state.user.connected_acct_status === 'Reviewing') {
                    reviewStatus = <div className='mini-badge mini-badge-warning ml-1'>Reviewing</div>;
                } else if (this.state.user.connected_acct_status === 'Declined') {
                    reviewStatus = <div className='mini-badge mini-badge-danger ml-1'>Declined</div>;
                } else if (this.state.user.connected_acct_status === 'Approved') {
                    reviewStatus  = <div className='mini-badge mini-badge-success ml-1'>Approved</div>;
                }
            }

            if (this.state.accountType === 'debit') {
                financialForm = <div className='mb-3'>
                    <div className='setting-field-container mb-3'>
                        <InputWrapper label='Account Holder Name' required>
                            <input type='text' onChange={(e) => this.setState({accountHolder: e.target.value})} />
                        </InputWrapper>
                    </div>

                    <div className='setting-field-container mb-3'>
                        <div className='setting-child' required>
                            <InputWrapper label='Card Number' required>
                                <CardNumberElement className='w-100' />
                            </InputWrapper>
                        </div>

                        <div className='setting-child one-third'>
                            <InputWrapper label='Expiry Date' required>
                                <CardExpiryElement className='w-100' />
                            </InputWrapper>
                        </div>

                        <div className='setting-child one-third'>
                            <InputWrapper label='CVC' required>
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
                            <label className={this.state.ukBankType === 'bank' ? 'active' : ''} onClick={() => this.setSettings({ukBankType: 'bank'})}>
                                <div className='radio'>
                                    {this.state.ukBankType === 'bank' ? <div className='radio-selected'></div> : ''}
                                </div>
                                <span>Bank Account</span>
                            </label>

                            <label className={this.state.ukBankType === 'iban' ? 'active' : ''} onClick={() => this.setSettings({ukBankType: 'iban'})}>
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

                financialForm = <div className='mb-3'>
                    <div className='setting-field-container mb-3'>
                        <div className='setting-child'>
                            <InputWrapper label='Account Holder Name' required>
                                <input text='text' onChange={(e) => this.setState({accountHolder: e.target.value})} />
                            </InputWrapper>
                        </div>

                        <div className='setting-child quarter'>
                            <InputWrapper label='Country' required>
                                <CountryDropdown value={this.state.accountCountry === null ? '' : this.state.accountCountry} onChange={(val) => this.setState({accountCountry: val})} valueType='short' whitelist={supportedCountries} />
                            </InputWrapper>
                        </div>
                    </div>

                    {bankInfo}

                    <div className='text-right'>
                        <SubmitButton type='submit' loading={this.state.status === 'Adding Financial Account'} value='Add' />
                    </div>
                </div>
            }

            if (this.state.individual.verification.status === 'unverified') {
                verificationStatus = <div className='mini-badge mini-badge-warning ml-1'>Unverified</div>;
            } else if (this.state.individual.verification.status === 'verified') {
                verificationStatus = <div className='mini-badge mini-badge-success ml-1'>Verified</div>
            }

            return (
                <section id='connected-settings' className='main-panel'>
                    {status}
                    
                    <TitledContainer title='Connected Settings' icon={<FontAwesomeIcon icon={faLink} />} shadow bgColor='lightblue'>
                        <div className='account-id mb-3'>
                            <h2>{this.state.id}</h2>
                            <div className='d-flex'>
                                {verificationStatus}
                                {reviewStatus}
                            </div>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
            
                            this.addFinancialAccount();                
                        }}>
                            <div className='simple-container no-bg mb-3'>
                                <div className='simple-container-title'>Financial</div>
                
                                <div className='text-right mb-3'>
                                    <button className='add-card-mobile-button btn btn-info' type='button' onClick={() => this.setState({accountType: 'debit'})}><FontAwesomeIcon icon={faPlus} /> <FontAwesomeIcon icon={faCreditCard} /></button>
                                    <button className='add-bank-mobile-button btn btn-info' type='button' onClick={() => this.setState({accountType: 'bank'})}><FontAwesomeIcon icon={faPlus} /> <FontAwesomeIcon icon={faUniversity} /></button>
                                    <button className='add-card-button btn btn-info' type='button' onClick={() => this.setState({accountType: 'debit'})}>Add Debit Card</button>
                                    <button className='add-bank-button btn btn-info' type='button' onClick={() => this.setState({accountType: 'bank'})}>Add Bank Account</button>
                                </div>
                
                                {financialForm}

                                {this.state.external_accounts && this.state.external_accounts.data.length > 0 ? <React.Fragment>
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

                        <form onSubmit={(e)=> {
                            e.preventDefault();
                            this.updatePersonal();
                        }}>
                            <ConnectedSettingsForm settings={this.state} user={this.props.user} set={(state) => this.setState(state)}/>

                            <div className='text-right'>
                                <SubmitButton type='submit' loading={this.state.status === 'Updating Personal'} value='Update' />
                                <button className='btn btn-secondary' onClick={() => this.resetSettings()}>Reset</button>
                            </div>
                        </form>
                    </TitledContainer>
                </section>
            );
        }
        
        return <Loading size='7x' color='black' />;
    }
}

ConnectedSettings.propTypes = {

};

export default connect()(injectStripe(ConnectedSettings));