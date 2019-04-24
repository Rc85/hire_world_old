import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputWrapper from '../../utils/InputWrapper';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { connect } from 'react-redux';
import BirthdateInput from '../../utils/BirthdateInput';
import { IsTyping } from '../../../actions/ConfigActions';

class ConnectedSettingsForm extends Component {
    constructor(props) {
        super(props);
    }

    setSettings(obj) {
        this.props.set(obj);
    }
    
    render() {
        let supportedCountries = ['AT', 'AU', 'BE', 'CA', 'CH', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'LU', 'NL', 'NO', 'NZ', 'PT', 'SE', 'US'];
        let ssn, form, phone, mcc;

        if (this.props.settings.individual.address.country === 'US' || this.props.settings.individual.address.country === 'CA') {
            ssn = <div className='setting-child'>
                <InputWrapper label='SIN/SSN' required={!this.props.settings.individual.ssn_last_4_provided}>
                    <input type='text' defaultValue={this.props.settings.individual.id_number === null ? '' : this.props.settings.individual.id_number} maxLength='9' onChange={(e) => this.setSettings({
                        ...this.props.settings,
                        ...{individual: {
                            ...this.props.settings.individual,
                            ...{id_number: e.target.value}
                        }}
                    })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required={!this.props.settings.individual.ssn_last_4_provided} />
                </InputWrapper>
            </div>;

            if (this.props.settings.individual.address.country === 'US') {
                phone = <div className='setting-child quarter'>
                    <InputWrapper label='Phone Number' required>
                        <input type='text' defaultValue={this.props.settings.individual.phone === null ? '' : this.props.settings.individual.phone} onChange={(e) => this.setSettings({
                            ...this.props.settings,
                            ...{individual: {
                                ...this.props.settings.individual,
                                ...{phone: e.target.value}
                            }}
                        })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required /> 
                    </InputWrapper>
                </div>;

                mcc = <div className='setting-child quarter'>
                    <InputWrapper label='MCC' required>
                        <input type='text' maxLength='4' defaultValue={this.props.settings.business_profile.mcc === null ? '' : this.props.settings.business_profile.mcc} onChange={(e) => this.setSettings({
                            ...this.props.settings,
                            ...{business_profile: {
                                ...this.props.settings.business_profile,
                                mcc: e.target.value
                            }}
                        })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required /> 
                    </InputWrapper>
                    <a href='https://stripe.com/docs/connect/setting-mcc#list' rel='noopener noreferrer' target='_blank'>What is this?</a>
                </div>;
            }
        }

        if (this.props.settings.business_type === 'company') {
            form = <div className='simple-container no-bg mb-3'>
                <div className='simple-container-title'>Company</div>
                
                <div className='setting-field-container mb-3'>
                    <InputWrapper label='Company Name' required>
                        <input type='text' value={this.props.settings.company.name === null ? '' : this.props.settings.company.name} onChange={(e) => this.setState({
                            ...this.props.settings,
                            ...{company: {
                                ...this.props.settings.company,
                                ...{name: e.target.value === '' ? null : e.target.value}
                            }}
                        })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                    </InputWrapper>
                </div>

                <div className='setting-field-container mb-3'>
                    <InputWrapper label='Company Tax ID' required>
                        <input type='text' value={this.props.settings.company.tax_id === null ? '' : this.props.settings.company.tax_id} onChange={(e) => this.setSettings({
                            ...this.props.settings,
                            ...{company: {
                                ...this.props.settings.company,
                                ...{tax_id: e.target.value === '' ? null : e.target.value}
                            }}
                        })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                    </InputWrapper>

                    <InputWrapper label='Company Phone Number'>
                        <input type='tel' value={this.props.settings.company.phone === null ? '' : this.props.settings.company.phone} onChange={(e) => this.setSettings({
                            ...this.props.settings,
                            ...{company: {
                                ...this.props.settings.company,
                                ...{phone: e.target.value === '' ? null : e.target.value}
                            }}
                        })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Country' required>
                            <CountryDropdown value={this.props.settings.company.address.country === null ? '' : this.props.settings.company.address.country} onChange={(e) => this.setSettings({
                            ...this.props.settings,
                            ...{company: {
                                ...this.props.settings.company,
                                ...{address: {
                                    ...this.props.settings.company.address,
                                    ...{country: e.target.value === '' ? null : e.target.value}
                                    }}
                                }}
                            })} valueType='short' />
                        </InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputWrapper label='Region' required>
                            <RegionDropdown value={this.props.settings.company.address.region === null ? '' : this.props.settings.company.address.region} onChange={(e) => this.setSettings({
                            ...this.props.settings,
                            ...{company: {
                                ...this.props.settings.company,
                                ...{address: {
                                    ...this.props.settings.company.address,
                                    ...{region: e.target.value === '' ? null : e.target.value}
                                    }}
                                }}
                            })} countryValueType='short' valueType='short' country={this.props.settings.company.address.country} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputWrapper label='City' required>
                            <input type='text' value={this.props.settings.company.address.city === null ? '' : this.props.settings.company.address.city} onChange={(e) => this.setSettings({
                            ...this.props.settings,
                            ...{company: {
                                ...this.props.settings.company,
                                ...{address: {
                                    ...this.props.settings.company.address,
                                    ...{city: e.target.value === '' ? null : e.target.value}
                                    }}
                                }}
                            })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                        </InputWrapper>
                    </div>
                </div>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child three-quarter'>
                        <InputWrapper label='Address Line 1' required>
                            <input type='text' value={this.props.settings.company.address.line1 === null ? '' : this.props.settings.company.address.line1} onChange={(e) => this.setSettings({
                                ...this.props.settings,
                                ...{company: {
                                    ...this.props.settings.company,
                                    ...{address: {
                                        ...this.props.settings.company.address,
                                        ...{line1: e.target.value === '' ? null : e.target.value}
                                    }}
                                }}
                            })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Postal/Zip Code' required>
                        <input type='text' value={this.props.settings.company.address.postal_code === null ? '' : this.props.settings.company.address.postal_code} onChange={(e) => this.setSettings({
                                ...this.props.settings,
                                ...{company: {
                                    ...this.props.settings.company,
                                    ...{address: {
                                        ...this.props.settings.company.address,
                                        ...{postal_code: e.target.value === '' ? null : e.target.value}
                                    }}
                                }}
                            })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                        </InputWrapper>
                    </div>
                </div>

                <div className='setting-field-container'>
                    <InputWrapper label='Address Line 2'>
                        <input type='text' value={this.props.settings.company.address.line2 === null ? '' : this.props.settings.company.address.line2} onChange={(e) => this.setSettings({
                            ...this.props.settings,
                            ...{company: {
                                ...this.props.settings.company,
                                ...{address: {
                                    ...this.props.settings.company.address,
                                    ...{line2: e.target.value === '' ? null : e.target.value}
                                }}
                            }}
                        })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>
            </div>;
        }

        return(
            <React.Fragment>
                <div className='simple-container no-bg mb-3'>
                    <div className='radio-container mb-3'>
                        <label htmlFor='business_type_individual' className={this.props.settings.business_type === 'individual' ? 'active' : ''} onClick={() => this.setSettings({
                            ...this.props.settings,
                            ...{business_type: 'individual'}
                        })}>
                            <div className='radio'>
                                <input type='radio' name='business_type' required id='business_type_individual' readOnly checked={this.props.settings.business_type === 'individual'} />
                                {this.props.settings.business_type === 'individual' ? <div className='radio-selected'></div> : ''}
                            </div>
    
                            <span>Individual</span>
                        </label>
    
                        <label htmlFor='business_type_company' className={this.props.settings.business_type === 'company' ? 'active' : ''} onClick={() => this.setSettings({
                            ...this.props.settings,
                            ...{business_type: 'company'}
                        })}>
                            <div className='radio'>
                                <input type='radio' name='business_type' required id='business_type_company' readOnly checked={this.props.settings.business_type === 'company'} />
                                {this.props.settings.business_type === 'company' ? <div className='radio-selected'></div> : ''}
                            </div>
    
                            <span>Company</span>
                        </label>
                    </div>

                    <div className='simple-container-title'>Personal Information</div>

                    <div className='setting-field-container mb-3'>
                        <InputWrapper label='First Name' required>
                            <input type='text' defaultValue={this.props.settings.individual.first_name === null ? '' : this.props.settings.individual.first_name} onChange={(e) => this.setSettings({
                                ...this.props.settings,
                                ...{individual: {
                                    ...this.props.settings.individual,
                                    ...{first_name: e.target.value === '' ? null : e.target.value}
                                }}
                            })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                        </InputWrapper>

                        <InputWrapper label='Last Name' required>
                            <input type='text' defaultValue={this.props.settings.individual.last_name === null ? '' : this.props.settings.individual.last_name} onChange={(e) => this.setSettings({
                                ...this.props.settings,
                                ...{individual: {
                                    ...this.props.settings.individual,
                                    ...{last_name: e.target.value === '' ? null : e.target.value}
                                }}
                            })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                        </InputWrapper>
                    </div>

                    <div className='setting-field-container mb-3'>
                        <div className='setting-child'>
                            <InputWrapper label='Country' required>
                                <CountryDropdown value={this.props.settings.individual.address.country === null ? '' : this.props.settings.individual.address.country} onChange={(val) => this.setSettings({
                                    ...this.props.settings,
                                    ...{individual: {
                                        ...this.props.settings.individual,
                                        ...{address: {
                                            ...this.props.settings.individual.address,
                                            ...{country: val}
                                        }}
                                    }}
                                })} valueType='short' whitelist={supportedCountries} />
                            </InputWrapper>
                        </div>

                        <div className='setting-child'>
                            <InputWrapper label='Region' required>
                                <RegionDropdown value={this.props.settings.individual.address.state === null ? '' : this.props.settings.individual.address.state} country={this.props.settings.individual.address.country} onChange={(val) => this.setSettings({
                                    ...this.props.settings,
                                    ...{individual: {
                                        ...this.props.settings.individual,
                                        ...{address: {
                                            ...this.props.settings.individual.address,
                                            ...{state: val}
                                        }}
                                    }}
                                })} countryValueType='short' valueType='short' />
                            </InputWrapper>
                        </div>

                        <div className='setting-child'>
                            <InputWrapper label='City' required>
                                <input type='text' defaultValue={this.props.settings.individual.address.city === null ? '' : this.props.settings.individual.address.city} onChange={(e) => this.setSettings({
                                    ...this.props.settings,
                                    ...{individual: {
                                        ...this.props.settings.individual,
                                        ...{address: {
                                            ...this.props.settings.individual.address,
                                            ...{city: e.target.value}
                                        }}
                                    }}
                                })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                            </InputWrapper>
                        </div>
                    </div>

                    <div className='setting-field-container mb-3'>
                        <div className='setting-child three-quarter'>
                            <InputWrapper label='Address Line 1' required>
                                <input type='text' defaultValue={this.props.settings.individual.address.line1 === null ? '' : this.props.settings.individual.address.line1} onChange={(e) => this.setSettings({
                                    ...this.props.settings,
                                    ...{individual: {
                                        ...this.props.settings.individual,
                                        ...{address: {
                                            ...this.props.settings.individual.address,
                                            ...{line1: e.target.value}
                                        }}
                                    }}
                                })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                            </InputWrapper>
                        </div>

                        <div className='setting-child quarter'>
                            <InputWrapper label='Postal/Zip Code' required>
                                <input type='text' defaultValue={this.props.settings.individual.address.postal_code === null ? '' : this.props.settings.individual.address.postal_code} onChange={(e) => this.setSettings({
                                    ...this.props.settings,
                                    ...{individual: {
                                        ...this.props.settings.individual,
                                        ...{address: {
                                            ...this.props.settings.individual.address,
                                            ...{postal_code: e.target.value}
                                        }}
                                    }}
                                })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                            </InputWrapper>
                        </div>
                    </div>

                    <div className='setting-field-container mb-3'>
                        <div className='setting-child'>
                            <InputWrapper label='Address Line 2'>
                                <input type='text' defaultValue={this.props.settings.individual.address.line2 === null ? '' : this.props.settings.individual.address.line2} onChange={(e) => this.setSettings({
                                    ...this.props.settings,
                                    ...{individual: {
                                        ...this.props.settings.individual,
                                        ...{address: {
                                            ...this.props.settings.individual.address,
                                            ...{line2: e.target.value}
                                        }}
                                    }}
                                })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                            </InputWrapper>
                        </div>

                        {phone}
                    </div>

                    <div className='setting-field-container mb-3'>
                        <div className='setting-child'>
                            <BirthdateInput year={this.props.settings.individual.dob.year} month={this.props.settings.individual.dob.month} day={this.props.settings.individual.dob.day}
                            setYear={(val) => this.setSettings({
                                ...this.props.settings,
                                ...{individual: {
                                    ...this.props.settings.individual,
                                    ...{dob: {
                                        ...this.props.settings.individual.dob,
                                        ...{year: val}
                                    }}
                                }}
                            })}
                            setMonth={(val) => this.setSettings({
                                ...this.props.settings,
                                ...{individual: {
                                    ...this.props.settings.individual,
                                    ...{dob: {
                                        ...this.props.settings.individual.dob,
                                        ...{month: val}
                                    }}
                                }}
                            })}
                            setDay={(val) => this.setSettings({
                                ...this.props.settings,
                                ...{individual: {
                                    ...this.props.settings.individual,
                                    ...{dob: {
                                        ...this.props.settings.individual.dob,
                                        ...{day: val}
                                    }}
                                }}
                            })} required />
                        </div>

                        {ssn}

                        <div className='setting-child'>
                            <InputWrapper label='Email' required={this.props.settings.individual.address.counter === 'US'}>
                                <input type='email' defaultValue={this.props.settings.email === null ? '' : this.props.settings.email} onChange={(e) => this.setSettings({
                                    ...this.props.settings,
                                    email: e.target.value,
                                    ...{individual: {
                                        ...this.props.settings.individual,
                                        email: e.target.value,
                                    }}
                                })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required={this.props.settings.individual.address.counter === 'US'} />
                            </InputWrapper>
                        </div>
                    </div>
                </div>

                <div className='simple-container no-bg mb-3'>
                    <div className='simple-container-title'>Business</div>

                    <div className='setting-field-container mb-3'>
                        <InputWrapper label='Business Name'>
                            <input type='text' defaultValue={this.props.settings.business_profile.name === null ? '' : this.props.settings.business_profile.name} onChange={(e) => this.setSettings({
                                ...this.props.settings,
                                ...{business_profile: {
                                    ...this.props.settings.business_profile,
                                    ...{name: e.target.value}
                                }}
                            })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputWrapper>
                    </div>

                    <div className='setting-field-container mb-3'>
                        <div className='setting-child'>
                            <InputWrapper label='Business Description' required={this.props.settings.individual.address.country === 'US' || this.props.settings.company.address.country === 'US'}>
                                <input type='text' defaultValue={this.props.settings.business_profile.product_description === null ? '' : this.props.settings.business_profile.product_description} onChange={(e) => this.setSettings({
                                    ...this.props.settings,
                                    ...{business_profile: {
                                        ...this.props.settings.business_profile,
                                        ...{product_description: e.target.value}
                                    }}
                                })} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required={this.props.settings.individual.address.country === 'US' || this.props.settings.company.address.country === 'US'} />
                            </InputWrapper>
                        </div>

                        {mcc}
                    </div>
                </div>

                {form}
            </React.Fragment>
        )
    }
}

ConnectedSettingsForm.propTypes = {
    settings: PropTypes.object,
    user: PropTypes.object,
    update: PropTypes.func
};

export default connect()(ConnectedSettingsForm);