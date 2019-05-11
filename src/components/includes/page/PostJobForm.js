import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InputWrapper from '../../utils/InputWrapper';
import { IsTyping } from '../../../actions/ConfigActions';
import InputGroup from '../../utils/InputGroup';
import { faCheck } from '@fortawesome/pro-solid-svg-icons';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import TextArea from '../../utils/TextArea';
import { connect } from 'react-redux';
import Tooltip from '../../utils/Tooltip';
import DatePicker from 'react-datepicker';
import moment from 'moment';

class PostJobForm extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            localFocused: false,
            remoteFocused: false,
            onlineFocused: false
        }
    }
    
    render() {
        let budgetThreshold, budgetInput, paymentOptions;

        if (this.props.data.budgetThreshold === 'Between') {
            budgetInput = <React.Fragment>
                <input type='text' onChange={(e) => this.props.set('budget', e.target.value)} value={this.props.data.budget === null ? '' : this.props.data.budget} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                <span className='input-group-text-separator'>to</span>
                <input type='text' onChange={(e) => this.props.set('budgetEnd', e.target.value)} value={this.props.data.budgetEnd === null ? '' : this.props.data.budgetEnd} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
            </React.Fragment>
        } else if (this.props.data.budgetThreshold === 'Less than' || this.props.data.budgetThreshold === 'Approximately' || this.props.data.budgetThreshold === 'Exactly') {
            budgetInput = <input type='text' onChange={(e) => this.props.set('budget', e.target.value)} value={this.props.data.budget === null ? '' : this.props.data.budget} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />;
        } else if (this.props.data.budgetThreshold !== 'To Be Discussed') {
            budgetInput = <input type='text' value={this.props.data.budget === null ? '' : this.props.data.budget} />
        }

        if (this.props.data.paymentType === 'Budget') {
            budgetThreshold = <select onChange={(e) => this.props.set('budgetThreshold', e.target.value)} value={this.props.data.budgetThreshold} required>
                <option value=''></option>
                <option value='Less than'>Less than</option>
                <option value='Approximately'>Approximately</option>
                <option value='Exactly'>Exactly</option>
            </select>;
        } else if (this.props.data.paymentType === 'Salary' || this.props.data.paymentType === 'Hourly Wage') {
            budgetThreshold = <select onChange={(e) => this.props.set('budgetThreshold', e.target.value)} value={this.props.data.budgetThreshold} required>
                <option value=''></option>
                <option value='To Be Discussed'>To Be Discussed</option>
                <option value='Between'>Between</option>
                <option value='Approximately'>Approximately</option>
                <option value='Exactly'>Exactly</option>
            </select>;
        } else {
            budgetThreshold = <select>
                <option value=''></option>
            </select>
        }

        if (this.props.data.type === 'Project') {
            paymentOptions = <select onChange={(e) => this.props.set('paymentType', e.target.value)} value={this.props.data.paymentType} required>
                <option value=''></option>
                <option value='Budget'>Budget</option>
            </select>;
        } else if (this.props.data.type === 'Contract') {
            paymentOptions = <select onChange={(e) => this.props.set('paymentType', e.target.value)} value={this.props.data.paymentType} required>
                <option value=''></option>
                <option value='Budget'>Budget</option>
                <option value='Salary'>Salary</option>
                <option value='Hourly Wage'>Hourly Wage</option>
            </select>;
        } else if (this.props.data.type === 'Part-time' || this.props.data.type === 'Full-time' || this.props.data.type === 'Temporary') {
            paymentOptions = <select onChange={(e) => this.props.set('paymentType', e.target.value)} value={this.props.data.paymentType} required>
                <option value=''></option>
                <option value='Salary'>Salary</option>
                <option value='Hourly Wage'>Hourly Wage</option>
            </select>;
        } else {
            paymentOptions = <select>
                <option value=''></option>
            </select>
        }
        
        return (
            <React.Fragment>
                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Title' required>
                            <input type='text' onChange={(e) => this.props.set('title', e.target.value)} value={this.props.data.title} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Expire Date' required className='pb-1'>
                        <DatePicker dropdownMode='select' onChange={(val) => this.props.set('expire', val)} selected={this.props.data.expire} value={moment(this.props.data.expire).isValid() ? moment(this.props.data.expire).format('MM-DD-YYYY') : ''} />
                        </InputWrapper>
                    </div>
                </div>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Sector' required>
                            <select onChange={(e) => this.props.set('sector', e.target.value)} value={this.props.data.sector} required>
                                {this.props.sectors.map((sector, i) => {
                                    return <option key={sector.sector} value={sector.sector}>{sector.sector}</option>
                                })}
                            </select>
                        </InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputWrapper label='Job Type' required>
                            <select onChange={(e) => this.props.set('type', e.target.value)} value={this.props.data.type} required>
                                <option value=''></option>
                                <option value='Temporary'>Temporary</option>
                                <option value='Part-time'>Part-time</option>
                                <option value='Full-time'>Full-time</option>
                                <option value='Contract'>Contract</option>
                                <option value='Project'>Project</option>
                            </select>
                        </InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputWrapper label='Work Area' required>
                            <div className='checkbox-label-container'>
                                <label className={`checkbox-label ${this.props.data.local ? 'active' : ''} ${this.state.localFocused ? 'hovered' : ''}`} name='work-area' required>
                                    <input type='checkbox' onChange={() => this.props.set('local', !this.props.data.local)} checked={this.props.data.local} onFocus={() => this.setState({localFocused: true})} onBlur={() => this.setState({localFocused: false})} />

                                    <div className='checkbox-container'>
                                        <div className='checkbox'>
                                            {this.props.data.local ? <FontAwesomeIcon icon={faCheck} /> : ''}
                                        </div>
                                        <span className='checkbox-label-text'>Local</span>
                                    </div>
                                </label>

                                <label className={`checkbox-label ${this.props.data.remote ? 'active' : ''} ${this.state.remoteFocused ? 'hovered' : ''}`} name='work-area' required>
                                    <input type='checkbox' onChange={() => this.props.set('remote', !this.props.data.remote)} checked={this.props.data.remote} onFocus={() => this.setState({remoteFocused: true})} onBlur={() => this.setState({remoteFocused: false})} />

                                    <div className='checkbox-container'>
                                        <div className='checkbox'>
                                            {this.props.data.remote ? <FontAwesomeIcon icon={faCheck} /> : ''}
                                        </div>
                                        <span className='checkbox-label-text'>Remote</span>
                                    </div>
                                </label>

                                <label className={`checkbox-label ${this.props.data.online ? 'active' : ''} ${this.state.onlineFocused ? 'hovered' : ''}`} name='work-area' required>
                                    <input type='checkbox' onChange={() => this.props.set('online', !this.props.data.online)} checked={this.props.data.online} onFocus={() => this.setState({onlineFocused: true})} onBlur={() => this.setState({onlineFocused: false})} />

                                    <div className='checkbox-container'>
                                        <div className='checkbox'>
                                            {this.props.data.online ? <FontAwesomeIcon icon={faCheck} /> : ''}
                                        </div>
                                        <span className='checkbox-label-text'>Link Work</span>
                                    </div>
                                </label>
                            </div>
                        </InputWrapper>
                    </div>
                </div>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputGroup label='Payment' required>
                            {paymentOptions}

                            {budgetThreshold}

                            {budgetInput}
                        </InputGroup>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Open Positions'>
                            <input type='number' onChange={(e) => this.props.set('positions', e.target.value)} value={this.props.data.positions === null ? '' : this.props.data.positions} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} placeholder='Default 1' />
                        </InputWrapper>
                    </div>
                </div>

                <div className='setting-field-container d-flex-between-center mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Company' disabled={this.props.data.postAsUser} required={!this.props.data.postAsUser}>
                            <input type='text' onChange={(e) => this.props.set('company', e.target.value === '' ? null : e.target.value)} value={this.props.data.company === null ? '' : this.props.data.company} disabled={this.props.data.postAsUser} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputWrapper label='Company Website' disabled={this.props.data.postAsUser}>
                            <input type='text' onChange={(e) => this.props.set('website', e.target.value === '' ? null : e.target.value)} value={this.props.data.website === null ? '' : this.props.data.website} disabled={this.props.data.postAsUser} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child three-quarter'>
                        <label><input type='checkbox' onChange={() => this.props.set('postAsUser', !this.props.data.postAsUser)} checked={this.props.data.postAsUser} /> Post as username instead of company</label>
                    </div>
                </div>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Country' required>
                            <CountryDropdown value={this.props.data.country} onChange={(val) => this.props.set('country', val)} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputWrapper label='Region' required>
                            <RegionDropdown value={this.props.data.region} onChange={(val) => this.props.set('region', val)} country={this.props.data.country} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputWrapper label='City' required>
                            <input type='text' onChange={(e) => this.props.set('city', e.target.value)} value={this.props.data.city} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                        </InputWrapper>
                    </div>
                </div>

                <InputWrapper label='Details' required className='mb-3'><TextArea onChange={(val) => this.props.set('details', val)} className='w-100' textAreaClassName='w-100' value={this.props.data.details} required /></InputWrapper>

                <div className='mb-3'><label><input type='checkbox' onChange={() => this.props.set('notification', !this.props.data.notification)} checked={this.props.data.notification} /> Notify me by email whenever a user applies</label></div>
            </React.Fragment>
        );
    }
}

PostJobForm.propTypes = {

};

export default connect()(PostJobForm);