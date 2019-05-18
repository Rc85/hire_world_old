import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CountryDropdown } from 'react-country-region-selector';
import { connect } from 'react-redux';
import InputWrapper from './utils/InputWrapper';
import SubmitButton from './utils/SubmitButton';
import { IsTyping } from '../actions/ConfigActions';
import { IbanElement } from 'react-stripe-elements';

class AddBankAccount extends Component {
    render() {
        let bankInfo;

        if (this.props.value.accountCountry === 'CA') {
            bankInfo = <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='Account Number' required>
                        <input type='text' onChange={(e) => this.props.set('accountNumber', e.target.value)} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>

                <div className='setting-child quarter'>
                    <InputWrapper label='Transit Number' required>
                        <input type='text' onChange={(e) => this.props.setRoutingNumber('routing', e.target.value)} maxLength='5' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>

                <div className='setting-child quarter'>
                    <InputWrapper label='Institution Number' required>
                        <input type='text' onChange={(e) => this.props.setRoutingNumber('branch', e.target.value)} maxLength='3' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>
            </div>;
        } else if (this.props.value.accountCountry === 'US') {
            bankInfo = <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='Account Number' required>
                        <input type='text' onChange={(e) => this.props.set('accountNumber', e.target.value)} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>

                <div className='setting-child quarter'>
                    <InputWrapper label='Routing Number' required>
                        <input type='text' onChange={(e) => this.props.setRoutingNumber('routing', e.target.value)} maxLength='9' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>
            </div>;
        } else if (this.props.value.accountCountry === 'AU') {
            bankInfo = <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='Account Number' required>
                        <input type='text' onChange={(e) => this.props.set('accountNumber', e.target.value)} minLength='6' maxLength='10' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>

                <div className='setting-child quarter'>
                    <InputWrapper label='BSB' required>
                        <input type='text' onChange={(e) => this.props.setRoutingNumber('routing', e.target.value)} maxLength='6' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>
            </div>;
        } else if (this.props.value.accountCountry === 'BR') {
            bankInfo = <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='Account Number' required>
                        <input type='text' onChange={(e) => this.props.set('accountNumber', e.target.value)} />
                    </InputWrapper>
                </div>

                <div className='setting-child quarter'>
                    <InputWrapper label='Bank Code' required>
                        <input type='text' onChange={(e) => this.props.setRoutingNumber('routing', e.target.value)} maxLength='3' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>

                <div className='setting-child quarter'>
                    <InputWrapper label='Branch Code' required>
                        <input type='text' onChange={(e) => this.props.setRoutingNumber('branch', e.target.value)} maxLength='4' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>
            </div>;
        } else if (this.props.value.accountCountry === 'HK') {
            bankInfo = <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='Account Number' required>
                        <input type='text' onChange={(e) => this.props.set('accountNumber', e.target.value)} minLength='6' maxLength='9' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>

                <div className='setting-child quarter'>
                    <InputWrapper label='Clearing Code' required>
                        <input type='text' onChange={(e) => this.props.setRoutingNumber('routing', e.target.value)} maxLength='3' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>

                <div className='setting-child quarter'>
                    <InputWrapper label='Branch Code' required>
                        <input type='text' onChange={(e) => this.props.setRoutingNumber('branch', e.target.value)} maxLength='3' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>
            </div>;
        } else if (this.props.value.accountCountry === 'MX') {
            bankInfo = <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='Account Number (CLABE)' required>
                        <input type='text' onChange={(e) => this.props.set('accountNumber', e.target.value)} maxLength='18' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>
            </div>;
        } else if (this.props.value.accountCountry === 'NZ') {
            bankInfo = <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='Account Number' required>
                        <input type='text' onChange={(e) => this.props.set('accountNumber', e.target.value)} minLength='15' maxLength='16' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>
            </div>;
        } else if (this.props.value.accountCountry === 'GB') {
            let bankType;

            if (this.props.value.ukBankType === 'bank') {
                bankType = <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Account Number' required>
                            <input type='text' onChange={(e) => this.props.set('accountNumber', e.target.value)} maxLength='8' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Sort Code' required>
                            <input type='text' onChange={(e) => this.props.setRoutingNumber('routing', e.target.value)} maxLength='6' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputWrapper>
                    </div>
                </div>;
            } else if (this.props.value.ukBankType === 'iban') {
                bankType = <InputWrapper label='IBAN' className='pr-2 pb-2 pl-2'>
                    <IbanElement className='w-100' supportedCountries={['SEPA']} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                </InputWrapper>;
            }
            bankInfo = <div>
                <div className='mb-3'>The information required for UK-based bank accounts depends on the currency being used and the country of your Stripe account. EUR-denominated UK bank accounts and some countries that support UK-based GBP accounts may need to provide IBAN information instead of an account number and sort code.</div>

                <div className='radio-container'>
                    <label className={this.props.value.ukBankType === 'bank' ? 'active' : ''} onClick={() => this.props.set('ukBankType', 'bank')}>
                        <div className='radio'>
                            {this.props.value.ukBankType === 'bank' ? <div className='radio-selected'></div> : ''}
                        </div>
                        <span>Bank Account</span>
                    </label>

                    <label className={this.props.value.ukBankType === 'iban' ? 'active' : ''} onClick={() => this.props.set('ukBankType', 'iban')}>
                        <div className='radio'>
                            {this.props.value.ukBankType === 'iban' ? <div className='radio-selected'></div> : ''}
                        </div>
                        <span>IBAN</span>
                    </label>
                </div>

                {bankType}
            </div>;
        }  else if (['AT', 'BE', 'DK', 'FI', 'FR', 'DE', 'GI', 'IE', 'IT', 'LU', 'NL', 'NO', 'PT', 'ES', 'SE', 'CH'].indexOf(this.props.value.accountCountry) >= 0) {
            bankInfo = <InputWrapper label='IBAN' className='pr-2 pb-2 pl-2 mb-3'>
                <IbanElement className='w-100' supportedCountries={['SEPA']} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
            </InputWrapper>;
            /* bankInfo = <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='Account Number' required>
                        <input type='text' onChange={(e) => this.props.set(e.target.value)} maxLength='8' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>

                <div className='setting-child quarter'>
                    <InputWrapper label='Sort Code' required>
                        <input type='text' onChange={(e) => this.props.setRoutingNumber('routing', e.target.value)} maxLength='8' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>
            </div>; */
        }

        return (
            <div className='mb-3'>
                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Account Holder Name' required>
                            <input text='text' value={this.props.value.accountHolder} onChange={(e) => this.props.set('accountHolder', e.target.value)} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Country' required>
                            <CountryDropdown value={this.props.value.accountCountry === null ? '' : this.props.value.accountCountry} onChange={(val) => this.props.setCountry(val)} valueType='short' whitelist={this.props.supportedCountries} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Currency' required>
                            <input type='text' value={this.props.value.accountCurrency} list='currency-list' onChange={(e) => this.props.set('accountCurrency', e.target.value)} />
                            <datalist id='currency-list'>
                                <option value='AUD'>AUD</option>
                                <option value='CAD'>CAD</option>
                                <option value='EUR'>EUR</option>
                                <option value='USD'>USD</option>
                            </datalist>
                        </InputWrapper>
                    </div>
                </div>

                {bankInfo}

                <div className='text-right'>
                    <SubmitButton type='submit' loading={this.props.value.status === 'Adding Financial Account'} value='Add' />
                    <button className='btn btn-secondary' type='reset'>Clear</button>
                </div>
            </div>
        );
    }
}

AddBankAccount.propTypes = {
    accountCountry: PropTypes.string,
    setCountry: PropTypes.func,
    set: PropTypes.func,
    setRoutingNumber: PropTypes.func,
    set: PropTypes.func
};

export default connect()(AddBankAccount);