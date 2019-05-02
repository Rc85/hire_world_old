import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LogError } from '../utils/LogError';
import fetch from 'axios';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faPlus, faCreditCard, faUniversity } from '@fortawesome/pro-solid-svg-icons';
import Loading from '../utils/Loading';
import LinkWorkSettingsForm from '../includes/page/LinkWorkSettingsForm';
import { connect } from 'react-redux';
import { Alert } from '../../actions/AlertActions';
import { CardNumberElement, CardCVCElement, CardExpiryElement, injectStripe, IbanElement } from 'react-stripe-elements';
import FinancialAccountRow from '../includes/page/FinancialAccountRow';
import SubmitButton from '../utils/SubmitButton';
import InputWrapper from '../utils/InputWrapper';
import { Redirect } from 'react-router-dom';
import DocumentUploader from '../utils/DocumentUploader';
import { IsTyping } from '../../actions/ConfigActions';
import LabelBadge from '../utils/LabelBadge';
import StaticAlert from '../utils/StaticAlert';
import AddBankAccount from '../includes/page/AddBankAccount';
import { PromptOpen, PromptReset } from '../../actions/PromptActions';
import { ShowLoading, HideLoading } from '../../actions/LoadingActions';

let financialResetButton;

class LinkWorkSettings extends Component {
    constructor(props) {
        super(props);

        this.routingNumber = '';
        this.branchNumber = '';
        
        this.state = {
            status: 'Fetching',
            statusMessage: '',
            user: {},
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
                    requirements: {
                        currently_due: [],
                        eventually_due: [],
                        past_due: []
                    },
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
            accountCurrency: '',
            documentFront: null,
            documentBack: null
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.prompt.data && this.props.prompt.data.action === 'close link work account') {
            if (this.props.prompt.input !== prevProps.prompt.input) {
                this.closeAccount();
                this.props.dispatch(PromptReset());
            }
        }
    }
    
    componentDidMount() {
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
        let token;

        if (this.state.accountType === 'bank') {
            token = await this.props.stripe.createToken('bank_account', {
                country: this.state.accountCountry,
                currency: this.state.accountCurrency,
                routing_number: this.state.accountRoutingNumber,
                account_number: this.state.accountNumber,
                account_holder_name: this.state.accountHolder
            });
        } else if (this.state.accountType === 'debit') {
            token = await this.props.stripe.createToken({
                name: this.state.accountHolder,
                currency: this.state.accountCurrency
            });
        } else if (this.state.accountType === 'sepa') {
            token = await this.props.stripe.createToken({
                currency: this.state.accountCurrency
            });
        }

        //this.setState({status: 'Adding Financial Account'});
        this.props.dispatch(ShowLoading('Adding Account'));

        fetch.post('/api/job/account/payment/add', {...token, user: this.props.user.user.username})
        .then(resp => {
            let state = {...this.state};
            this.props.dispatch(HideLoading());
            state.status = '';
            state.accountCountry = '';
            state.accountCurrency = '';
            state.accountRoutingNumber = '';
            state.accountNumber = '';
            state.accountHolder = '';
            
            if (resp.data.status === 'success') {
                state.external_accounts.data = resp.data.accounts;
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            this.setState(state);
        })
        .catch(err => {
            LogError(err, '/api/job/account/payment/add');
            this.props.dispatch(Alert('error', 'An error occurred'));
            this.props.dispatch(HideLoading());
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
            let state = {...this.state};
            state.status = '';

            if (resp.data.status === 'success') {
                for (let payment of state.external_accounts.data) {
                    payment.default_for_currency = false;
                }

                state.external_accounts.data[index] = resp.data.payment;
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            this.setState(state);
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
            state.status = '';

            if (resp.data.status === 'success') {
                state.external_accounts.data.splice(index, 1);
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            this.setState(state);
        })
        .catch(err => {
            LogError(err, '/api/job/account/payment/delete');
            this.setState({status: ''});
        });
    }

    uploadDocument() {
        let data = new FormData();

        let config = {
            headers: {
                front: false,
                back: false
            }
        }

        if (this.state.documentFront && this.state.documentFront.length === 0) {
            this.props.dispatch(Alert('error', 'No files to upload'));
        } else {
            this.setState({status: 'Uploading Document'});
            
            if (this.state.documentFront && this.state.documentFront.length === 1) {
                data.set('front', this.state.documentFront[0]);
                config.headers.front = true;
            }

            if (this.state.documentBack && this.state.documentBack.length === 1) {
                data.set('back', this.state.documentBack[0]);
                config.headers.back = true;
            }

            data.set('user', this.props.user.user.username);
        }

        fetch.post('/api/job/account/document/upload', data, config)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', ...resp.data.account, documentFront: null, documentBack: null});
            } else {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/job/account/document/upload');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    closeAccount() {
        this.props.dispatch(ShowLoading(`Closing Account...`));

        fetch.post('/api/job/account/close', {id: this.state.id, password: this.props.prompt.input, user: this.props.user.user.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: 'Closed'});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }

            this.props.dispatch(HideLoading());
        })
        .catch(err => {
            LogError(err, '/api/job/account/close');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
            this.props.dispatch(HideLoading());
        });
    }

    setCountry(val) {
        this.branchNumber = '';
        this.routingNumber = '';

        if (this.state.accountCountry) {
            if (['AT', 'BE', 'DK', 'FI', 'FR', 'DE', 'GI', 'IE', 'IT', 'LU', 'NL', 'NO', 'PT', 'ES', 'SE', 'CH'].indexOf(val) >= 0 && this.state.accountType === 'bank') {
                this.setState({accountCountry: val, accountType: 'sepa'});
            } else if (['AT', 'BE', 'DK', 'FI', 'FR', 'DE', 'GI', 'IE', 'IT', 'LU', 'NL', 'NO', 'PT', 'ES', 'SE', 'CH'].indexOf(val) >= 0 && this.state.accountType === 'sepa') {
                this.setState({accountCountry: val});
            } else if ((['CA', 'US', 'AU', 'NZ'].indexOf(val) >= 0 && this.state.accountType === 'sepa') || ['CA', 'US', 'AU', 'NZ'].indexOf(val) >= 0) {
                this.setState({accountCountry: val, accountType: 'bank'});
            } else if (val === 'GB') {
                this.setState({accountCountry: val, accountType: 'bank'});
            }
        } else {
            this.setState({accountCountry: val});
        }
    }

    set(key, val) {
        let obj = {};
        obj[key] = val;

        this.setState(obj);
    }
    
    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        }

        if (this.state.status === 'Closed') {
            return <Redirect to='/link_work/account/closed' />;
        } else if (this.state.status === 'Fetching') {
            return <Loading size='7x' color='black' />;
        }

        if (this.props.user.user) {
            let verificationStatus, verificationStatusText, status, reviewStatus, financialForm, uploadForm, payoutStatus, payoutText, paymentText, paymentStatus, bankText, bankStatus;

            let supportedCountries = ['AT', 'AU', 'BE', 'CA', 'CH', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'LU', 'NL', 'NO', 'NZ', 'PT', 'SE', 'US'];

            if (this.state.status === 'Fetching') {
                status = <Loading size='5x' />;
            }

            if (this.state.accountType === 'debit') {
                financialForm = <div className='mb-3'>
                    <div className='mb-3'>Only Debit Mastercard or Visa Debit can be used to accept payouts</div>
                    
                    <div className='setting-field-container mb-3'>
                        <div className='setting-child'>
                            <InputWrapper label='Account Holder Name' required>
                                <input type='text' onChange={(e) => this.setState({accountHolder: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                            </InputWrapper>
                        </div>

                        <div className='setting-child quarter'>
                            <InputWrapper label='Currency' required>
                                <input type='text' list='currency-list' onChange={(e) => this.setState({accountCurrency: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                                <datalist id='currency-list'>
                                    <option value='AUD'>AUD</option>
                                    <option value='CAD'>CAD</option>
                                    <option value='EUR'>EUR</option>
                                    <option value='USD'>USD</option>
                                </datalist>
                            </InputWrapper>
                        </div>
                    </div>

                    <div className='setting-field-container mb-3'>
                        <div className='setting-child'>
                            <InputWrapper label='Card Number' required className='pl-1 pb-1 pr-1'>
                                <CardNumberElement className='w-100' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                            </InputWrapper>
                        </div>

                        <div className='setting-child one-third'>
                            <InputWrapper label='Expiry Date' required className='pl-1 pb-1 pr-1'>
                                <CardExpiryElement className='w-100' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                            </InputWrapper>
                        </div>

                        <div className='setting-child one-third'>
                            <InputWrapper label='CVC' required className='pl-1 pb-1 pr-1'>
                                <CardCVCElement className='w-100' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                            </InputWrapper>
                        </div>
                    </div>

                    <div className='text-right'>
                        <SubmitButton type='submit' loading={this.state.status === 'Adding Financial Account'} value='Add' />
                    </div>
                </div>;
            } else if (this.state.accountType === 'bank' || this.state.accountType === 'sepa') {
                financialForm = <AddBankAccount
                value={this.state}
                set={(key, val) => this.set(key, val)}
                setCountry={(val) => this.setCountry(val)}
                setRoutingNumber={(type, val) => this.setRoutingNumber(type, val)}
                supportedCountries={supportedCountries} />;
            }

            if (this.state.individual.verification.status === 'unverified') {
                verificationStatus = 'secondary';
                verificationStatusText = 'Unverified';

                if (this.state.individual.verification.details_code === 'failed_other') {
                    verificationStatus = 'danger';
                    verificationStatusText = 'Failed';
                }
            } else if (this.state.individual.verification.status === 'verified') {
                verificationStatus = 'success';
                verificationStatusText = 'Verified';
            } else if (this.state.individual.verification.status === 'pending') {
                verificationStatus = 'warning';
                verificationStatusText = 'Pending';
            }

            if (this.state.charges_enabled) {
                paymentStatus = 'success';
                paymentText = 'Enabled';
            } else {
                paymentStatus = 'danger';
                paymentText = 'Disabled';
            }

            if (this.state.payouts_enabled) {
                payoutStatus = 'success';
                payoutText = 'Enabled';
            } else {
                payoutStatus = 'danger';
                payoutText = 'Disabled';
            }

            let bankAccountWarning;

            if (this.state.requirements && (this.state.requirements.past_due.includes('external_account') || this.state.requirements.currently_due.includes('external_account') || this.state.requirements.eventually_due.includes('external_account'))) {
                bankAccountWarning = <StaticAlert status='warning' text='A bank account is required' />;
            }

            if (this.state.user) {
                if (this.state.user.link_work_acct_status === 'Reviewing') {
                    reviewStatus = 'warning';
                } else if (this.state.user.link_work_acct_status === 'Declined') {
                    reviewStatus = 'danger';
                } else if (this.state.user.link_work_acct_status === 'Approved') {
                    reviewStatus = 'success';
                }
            }

            if (this.state.individual.address.country !== 'US' && this.state.individual.verification.status !== 'verified') {
                uploadForm = <form onSubmit={(e) => {
                    e.preventDefault();
                    this.uploadDocument();
                }}>
                    <div className='simple-container no-bg'>
                        <div className='simple-container-title'>Upload Document</div>
                        <p>Document needs to be:</p>

                        <ul>
                            <li>Colored</li>
                            <li>Smaller than 8000px by 8000px</li>
                            <li>JPG or PNG</li>
                            <li>Less than 5MB</li>
                        </ul>

                        <p>Note: If you're scanning a passport, you don't need to upload the back.</p>

                        <div className='setting-field-container mb-3'>
                            <InputWrapper label='Front'><DocumentUploader upload={(file) => this.setState({documentFront: file})} /></InputWrapper>
                            <InputWrapper label='Back'><DocumentUploader upload={(file) => this.setState({documentBack: file})} /></InputWrapper>
                        </div>

                        <div className='text-right'>
                            <SubmitButton type='submit' loading={this.state.status === 'Uploading Document'} value='Upload' />
                            <button className='btn btn-secondary' type='reset'>Clear</button>
                        </div>
                    </div>
                </form>;
            }

            let documentsRequired = false;
            let documentsRequiredText;

            if (this.state.individual.requirements) {
                if (this.state.individual.requirements.currently_due.indexOf('verification.document') > -1 || this.state.individual.requirements.eventually_due.indexOf('verification.document') > -1 || this.state.individual.requirements.past_due.indexOf('verification.document') > -1) {
                    documentsRequired = true;
                    documentsRequiredText = 'Identification documents required';

                    if (this.state.individual.verification.details_code === 'failed_other') {
                        documentsRequiredText = <span>Document verification failed. Reasons may include:
                            <ul>
                                <li>Images are not clear</li>
                                <li>Images are not legitimate</li>
                                <li>Information on images do not match account information</li>
                            </ul>
                        </span>;
                    }
                }
            }

            let bankAccountText, bankAccountStatus;

            if (this.state.external_accounts && this.state.external_accounts.data.length === 0) {
                bankAccountText = 'Required';
                bankAccountStatus = 'danger';
            }

            if (this.state.requirements && /^rejected/.test(this.state.requirements.disabled_reason)) {
                return <Redirect to='/error/link_work/403' />;
            }

            return (
                <section id='link-work-settings' className='main-panel'>
                    {status}
                    
                    <TitledContainer title='Link Work Settings' icon={<FontAwesomeIcon icon={faLink} />} shadow bgColor='lightblue'>
                        <div className='account-id mb-3'>
                            <h2>{this.state.id}</h2>
                        </div>

                        <div className='link-work-badges'>
                            <div className='mr-2'><LabelBadge label='Account' text={verificationStatusText} status={verificationStatus} /></div>
                            <div className='mr-2'><LabelBadge label='Review' text={this.state.user.link_work_acct_status} status={reviewStatus} /></div>
                            <div className='mr-2'><LabelBadge label='Payments' text={paymentText} status={paymentStatus} /></div>
                            <div className='mr-2'><LabelBadge label='Payout' text={payoutText} status={payoutStatus} /></div>
                            {bankAccountText === 'Required' ? <div className='mr-2'><LabelBadge label='Bank' text={bankAccountText} status={bankAccountStatus} /></div> : '' }
                        </div>

                        {documentsRequired ? <StaticAlert status='warning' text={documentsRequiredText} /> : ''}
                        {bankAccountWarning}

                        <form onSubmit={(e) => {
                            e.preventDefault();
            
                            this.addFinancialAccount();                
                        }}>
                            <div className='simple-container no-bg mt-4 mb-3'>
                                <div className='simple-container-title'>Payout Accounts</div>
                
                                <div className='text-right mb-3'>
                                    <React.Fragment><button className='add-card-mobile-button btn btn-info' type='button' onClick={() => this.setState({accountType: 'debit'})}><FontAwesomeIcon icon={faPlus} /> <FontAwesomeIcon icon={faCreditCard} /></button> <button className='add-bank-mobile-button btn btn-info' type='button' onClick={() => this.setState({accountType: 'bank', accountCountry: ''})}><FontAwesomeIcon icon={faPlus} /> <FontAwesomeIcon icon={faUniversity} /></button></React.Fragment>
                                    
                                    <React.Fragment><button className='add-card-button btn btn-info' type='button' onClick={() => this.setState({accountType: 'debit'})}>Add a Card</button> <button className='add-bank-button btn btn-info' type='button' onClick={() => this.setState({accountType: 'bank', accountCountry: ''})}>Add Bank Account</button></React.Fragment>
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
                                </React.Fragment> : <div className='text-center'>To get approved faster by Hire World, we recommend adding a valid bank account.</div>}
                            </div>
                        </form>

                        <form onSubmit={(e)=> {
                            e.preventDefault();
                            this.updatePersonal();
                        }}>
                            <LinkWorkSettingsForm settings={this.state} user={this.props.user} set={(state) => this.setState(state)}/>

                            <div className='text-right'>
                                <SubmitButton type='submit' loading={this.state.status === 'Updating Personal'} value='Update' />
                                <button className='btn btn-secondary' type='button' onClick={() => this.resetSettings()}>Reset</button>
                                <button className='btn btn-danger' type='button' onClick={() => this.props.dispatch(PromptOpen(`Password:`, '', {type: 'password', action: 'close link work account'}))} disabled={this.state.status === 'Closing Account'}>Close Account</button>
                            </div>
                        </form>

                        {uploadForm}
                    </TitledContainer>
                </section>
            );
        }
        
        return <Loading size='7x' color='black' />;
    }
}

LinkWorkSettings.propTypes = {

};

const mapStateToProps = state => {
    return {
        prompt: state.Prompt
    }
}

export default connect(mapStateToProps)(injectStripe(LinkWorkSettings));