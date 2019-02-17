import React, { Component } from 'react';
import { connect } from 'react-redux';
import SubmitButton from '../../utils/SubmitButton';
import { Alert } from '../../../actions/AlertActions';
import { UpdateUser } from '../../../actions/LoginActions';
import PropTypes from 'prop-types';
import fetch from 'axios';
import { ShowWarning } from '../../../actions/WarningActions';
import { RegionDropdown, CountryDropdown } from 'react-country-region-selector';
import InputWrapper from '../../utils/InputWrapper';
import { LogError } from '../../utils/LogError';
import { isTyping } from '../../../actions/ConfigActions';

class ProfileSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            settings: {
                phone: this.props.user.user.user_phone || '',
                address: this.props.user.user.user_address || '',
                code: this.props.user.user.user_city_code || '',
                country: this.props.user.user.user_country || '',
                region: this.props.user.user.user_region || '',
                city: this.props.user.user.user_city || ''
            },
            status: '',
            statusMessage: ''
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.user.user !== this.props.user.user) {
            this.initialSettings = {
                phone: this.props.user.user.user_phone || '',
                address: this.props.user.user.user_address || '',
                code: this.props.user.user.user_city_code || '',
                country: this.props.user.user.user_country || '',
                region: this.props.user.user.user_region || '',
                city: this.props.user.user.user_city || ''
            }

            //this.setState({settings: this.initialSettings});
        }
    }
    
    componentDidMount() {
        if (this.props.user.user) {
            this.initialSettings = {
                phone: this.props.user.user.user_phone || '',
                address: this.props.user.user.user_address || '',
                code: this.props.user.user.user_city_code || '',
                country: this.props.user.user.user_country || '',
                region: this.props.user.user.user_region || '',
                city: this.props.user.user.user_city || ''
            }

            //this.setState({settings: this.initialSettings});
        }
    }
    
    save() {
        fetch.post('/api/user/settings/profile/save', this.state.settings)
        .then(resp => {
            if (resp.data.status === 'success') {
                if (resp.data.user.hide_email && !resp.data.user.allow_messaging && !resp.data.user.user_phone) {
                    this.props.dispatch(ShowWarning(`You've hidden and disabled all forms of contact`));
                }

                this.initialSettings = {
                    phone: resp.data.user.user_phone,
                    address: resp.data.user.user_address,
                    code: resp.data.user.user_city_code,
                    country: resp.data.user.user_country,
                    region: resp.data.user.user_region,
                    city: resp.data.user.user_city
                }

                this.setState({settings: this.initialSettings});

                this.props.dispatch(UpdateUser(resp.data.user));
            }
            
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/user/settings/profile/save'));
    }

    setSettings(obj) {
        let settings = Object.assign({}, this.state.settings, obj);
        this.setState({settings: settings});
    }

    render() {
        let status;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        return(
            <div id='profile-settings'>
                {status}
                <div className='setting-field-container mb-3'>
                    <div className='setting-child three-quarter'>
                        <InputWrapper label='Address'>
                            <input type='text' onChange={(e) => this.setSettings({address: e.target.value})} value={this.state.settings.address} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                        </InputWrapper>
                        {/* <label htmlFor='user-address'>Address:</label>
                        
                        <input type='text' name='address' id='user-address' onChange={(e) => this.setSettings({address: e.target.value})} defaultValue={this.initialSettings.address} /> */}
                    </div>
                    
                    <div className='setting-child quarter'>
                        <InputWrapper label='Postal/Zip Code'>
                            <input type='text'onChange={(e) => this.setSettings({code: e.target.value})} value={this.state.settings.code} maxLength='7' onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                        </InputWrapper>
                        {/* <label htmlFor='postalzip'>Postal Code/Zip Code:</label>
                        <input type='text' name='postalzip' id='postalzip' onChange={(e) => this.setSettings({code: e.target.value})} defaultValue={this.initialSettings.code} /> */}
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Phone Number'>
                            <input type='tel' onChange={(e) => this.setSettings({phone: e.target.value})} value={this.state.settings ? this.state.settings.phone : ''} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                        </InputWrapper>
                    </div>
                </div>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child three-quarter'>
                        <InputWrapper label='Country' required>
                            <CountryDropdown value={this.state.settings.country} onChange={(val) => this.setSettings({country: val})} valueType='short' />
                        </InputWrapper>
                        {/* <label htmlFor='country'>Country:</label>
                        <select name='country' id='country' onChange={(e) => this.setSettings({country: e.target.value})} defaultValue={this.initialSettings.country}>
                            
                        </select> */}
                    </div>

                    <div className='setting-child three-quarter'>
                        <InputWrapper label='Region' required>
                            <RegionDropdown value={this.state.settings.region} country={this.state.settings.country} onChange={(val) => this.setSettings({region: val})} countryValueType='short' valueType='short'  />
                        </InputWrapper>
                        {/* <label htmlFor='region'>Region:</label> */}           
                    </div>

                    <div className='setting-child three-quarter'>
                        <InputWrapper label='City'>
                            <input type='text' onChange={(e) => this.setSettings({city: e.target.value})} defaultValue={this.state.settings.city} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                        </InputWrapper>
                        {/* <label htmlFor='city'>City:</label>
                        <input type='text' name='city' id='city=input' onChange={(e) => this.setSettings({city: e.target.value})} defaultValue={this.state.settings.city} /> */}
                    </div>
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Save' loading={this.props.user.status === 'Loading'} onClick={() => this.save()} disabled={JSON.stringify(this.state.settings) === JSON.stringify(this.initialSettings)} />
                </div>
            </div>
        )
    }
}

ProfileSettings.propTypes = {
    user: PropTypes.object.isRequired
}

export default connect()(ProfileSettings);