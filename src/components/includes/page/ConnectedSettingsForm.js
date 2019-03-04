import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputWrapper from '../../utils/InputWrapper';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { connect } from 'react-redux';

class ConnectedSettingsForm extends Component {
    constructor(props) {
        super(props);
    }

    setSettings(obj) {
        this.props.set(obj);
    }
    
    render() {
        let supportedCountries = ['AT', 'AU', 'BE', 'CA', 'CH', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'LU', 'NL', 'NO', 'NZ', 'PT', 'SE', 'US'];
        let beginningYear = 1900;
        let currentYear = new Date().getFullYear();
        let yearsToAdd = parseInt(currentYear) - beginningYear - 19;
        let year = [];
        let ssn, form;

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

        if (this.props.settings.individual.dob.month === 1 || this.props.settings.individual.dob.month === 3 || this.props.settings.individual.dob.month === 5 || this.props.settings.individual.dob.month === 7 || this.props.settings.individual.dob.month === 8 || this.props.settings.individual.dob.month === 10 || this.props.settings.individual.dob.month === 12) {
            numOfDays = 31;
        } else if (this.props.settings.individual.dob.month === 4 || this.props.settings.individual.dob.month === 6 || this.props.settings.individual.dob.month === 9 || this.props.settings.individual.dob.month === 11) {
            numOfDays = 30;
        } else if (this.props.settings.individual.dob.month === 2) {
            if (this.props.settings.individual.dob.year) {
                if (parseInt(this.props.settings.individual.dob.year) % 4 === 0) {
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

        if (this.props.settings.country === 'US' || this.props.settings.country === 'CA') {
            ssn = <div className='setting-field-container quarter'>
                <InputWrapper label='SIN/SSN'>
                    <input type='number' maxLength='9' onChange={(e) => this.setState({ssn: e.target.value === '' ? null : e.target.value})} />
                </InputWrapper>
            </div>;
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
                        })} />
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
                        })} />
                    </InputWrapper>

                    <InputWrapper label='Company Phone Number'>
                        <input type='tel' value={this.props.settings.company.phone === null ? '' : this.props.settings.company.phone} onChange={(e) => this.setSettings({
                            ...this.props.settings,
                            ...{company: {
                                ...this.props.settings.company,
                                ...{phone: e.target.value === '' ? null : e.target.value}
                            }}
                        })} />
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
                            })} />
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
                            })} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Postal/Zip Code'>
                        <input type='text' value={this.props.settings.company.address.postal_code === null ? '' : this.props.settings.company.address.postal_code} onChange={(e) => this.setSettings({
                                ...this.props.settings,
                                ...{company: {
                                    ...this.props.settings.company,
                                    ...{address: {
                                        ...this.props.settings.company.address,
                                        ...{postal_code: e.target.value === '' ? null : e.target.value}
                                    }}
                                }}
                            })} />
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
                        })} />
                    </InputWrapper>
                </div>
            </div>;
        }

        return(
            <React.Fragment>
                <div className='simple-container no-bg mb-3'>
                    <div className='radio-container mb-3'>
                        <label className={this.props.settings.business_type === 'individual' ? 'active' : ''} onClick={() => this.setSettings({
                            ...this.props.settings,
                            ...{business_type: 'individual'}
                        })}>
                            <div className='radio'>
                                {this.props.settings.business_type === 'individual' ? <div className='radio-selected'></div> : ''}
                            </div>
    
                            <span>Individual</span>
                        </label>
    
                        <label className={this.props.settings.business_type === 'company' ? 'active' : ''} onClick={() => this.setSettings({
                            ...this.props.settings,
                            ...{business_type: 'company'}
                        })}>
                            <div className='radio'>
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
                            })} />
                        </InputWrapper>

                        <InputWrapper label='Last Name' required>
                            <input type='text' defaultValue={this.props.settings.individual.last_name === null ? '' : this.props.settings.individual.last_name} onChange={(e) => this.setState({
                                ...this.props.settings,
                                ...{individual: {
                                    ...this.props.settings.individual,
                                    ...{last_name: e.target.value === '' ? null : e.target.value}
                                }}
                            })} />
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
                                })} />
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
                                })} />
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
                                })} />
                            </InputWrapper>
                        </div>
                    </div>

                    <div className='setting-field-container mb-3'>
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
                            })} />
                        </InputWrapper>
                    </div>

                    <div className='setting-field-container mb-3'>
                        <div className='setting-child'>
                            <InputWrapper label='Date of Birth' required>
                                <select value={this.props.settings.individual.dob.year === null ? '' : this.props.settings.individual.dob.year} onChange={(e) => this.setSettings({
                                    ...this.props.settings,
                                    ...{individual: {
                                        ...this.props.settings.individual,
                                        ...{dob: {
                                            ...this.props.settings.individual.dob,
                                            ...{year: e.target.value}
                                        }}
                                    }}
                                })}>
                                    <option value='' disabled>Year</option>
                                    {years.reverse()}
                                </select>
    
                                <select value={this.props.settings.individual.dob.month === null ? '' : this.props.settings.individual.dob.month} onChange={(e) => this.setSettings({
                                    ...this.props.settings,
                                    ...{individual: {
                                        ...this.props.settings.individual,
                                        ...{dob: {
                                            ...this.props.settings.individual.dob,
                                            ...{month: e.target.value}
                                        }}
                                    }}
                                })}>
                                    <option value='' disabled>Month</option>
                                    {months}
                                </select>
    
                                <select value={this.props.settings.individual.dob.day === null ? '' : this.props.settings.individual.dob.day} onChange={(e) => this.setSettings({
                                    ...this.props.settings,
                                    ...{individual: {
                                        ...this.props.settings.individual,
                                        ...{dob: {
                                            ...this.props.settings.individual.dob,
                                            ...{day: e.target.value}
                                        }}
                                    }}
                                })}>
                                    <option value='' disabled>Day</option>
                                    {days}
                                </select>
                            </InputWrapper>
                        </div>

                        <div className='setting-child'>
                            <InputWrapper label='Phone Number'>
                                <input type='tel' defaultValue={this.props.settings.individual.phone_number === null ? '' : this.props.settings.individual.phone_number} onChange={(e) => this.setSettings({
                                    ...this.props.settings,
                                    ...{individual: {
                                        ...this.props.settings.individual,
                                        ...{phone_number: e.target.value}
                                    }}
                                })} />
                            </InputWrapper>
                        </div>

                        <div className='setting-child'>
                            <InputWrapper label='Email'>
                                <input type='email' defaultValue={this.props.settings.email === null ? '' : this.props.settings.email} onChange={(e) => this.setSettings({email: e.target.value})} />
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
                            })} />
                        </InputWrapper>
                    </div>

                    <div className='setting-field-container mb-3'>
                        <InputWrapper label='Business Description' required={this.props.settings.individual.address.country === 'US' || this.props.settings.company.address.country === 'US'}>
                            <input type='text' defaultValue={this.props.settings.business_profile.product_description === null ? '' : this.props.settings.business_profile.product_description} onChange={(e) => this.setSettings({
                                ...this.props.settings,
                                ...{business_profile: {
                                    ...this.props.settings.business_profile,
                                    ...{product_description: e.target.value}
                                }}
                            })} />
                        </InputWrapper>
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