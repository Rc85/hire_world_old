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

class ProfileSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            settings: {},
            status: '',
            statusMessage: ''
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.user.user !== this.props.user.user) {
            this.initialSettings = {
                businessName: this.props.user.user.user_business_name,
                phone: this.props.user.user.user_phone,
                address: this.props.user.user.user_address,
                code: this.props.user.user.user_city_code,
                country: this.props.user.user.user_country,
                region: this.props.user.user.user_region,
                city: this.props.user.user.user_city
            }

            this.setState({settings: this.initialSettings});
        }
    }
    
    componentDidMount() {
        if (this.props.user.user) {
            this.initialSettings = {
                businessName: this.props.user.user.user_business_name,
                phone: this.props.user.user.user_phone,
                address: this.props.user.user.user_address,
                code: this.props.user.user.user_city_code,
                country: this.props.user.user.user_country,
                region: this.props.user.user.user_region,
                city: this.props.user.user.user_city
            }

            this.setState({settings: this.initialSettings});
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
                    businessName: resp.data.user.user_business_name,
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
        console.log(this.state)
        let status;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        return(
            <div id='profile-settings'>
                {status}
                <div className='setting-field-container mb-3'>
                    <div className='setting-child three-quarter'>
                        <InputWrapper label='Business Name'>
                            <input type='text' onChange={(e) => this.setSettings({businessName: e.target.value})} maxLength='40' palceholder='Maximum 40 characters' defaultValue={this.state.settings.businessName} />
                        </InputWrapper>
                    </div>
                        {/* <label htmlFor='business-name'>Business Name:</label>
                        <input type='text' name='business_name' id='business-name' defaultValue={this.initialSettings.businessName} onChange={(e) => this.setSettings({businessName: e.target.value})} maxLength='40' placeholder='Maximum 40 characters' /> */}

                    <div className='setting-child quarter'>
                        <InputWrapper label='Phone Number'>
                            <input type='tel' onChange={(e) => this.setSettings({phone: e.target.value})} defaultValue={this.state.settings.phone} />
                        </InputWrapper>
                    </div>
                        {/* <label htmlFor='phone'>Phone Number:</label>
                        <input type='tel' name='phone' id='phone' onChange={(e) => this.setSettings({phone: e.target.value})} defaultValue={this.initialSettings.phone} /> */}
                </div>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child three-quarter'>
                        <InputWrapper label='Address'>
                            <input type='text' onChange={(e) => this.setSettings({address: e.target.value})} defaultValue={this.state.settings.address} />
                        </InputWrapper>
                        {/* <label htmlFor='user-address'>Address:</label>
                        
                        <input type='text' name='address' id='user-address' onChange={(e) => this.setSettings({address: e.target.value})} defaultValue={this.initialSettings.address} /> */}
                    </div>
                    
                    <div className='setting-child quarter'>
                        <InputWrapper label='Postal/Zip Code'>
                            <input type='text'onChange={(e) => this.setSettings({code: e.target.value})} defaultValue={this.state.settings.code} maxLength='7' />
                        </InputWrapper>
                        {/* <label htmlFor='postalzip'>Postal Code/Zip Code:</label>
                        <input type='text' name='postalzip' id='postalzip' onChange={(e) => this.setSettings({code: e.target.value})} defaultValue={this.initialSettings.code} /> */}
                    </div>
                </div>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child three-quarter'>
                        <InputWrapper label='Country'>
                            <select onChange={(e) => this.setSettings({country: e.target.value})} value={this.state.settings.country}>
                                <option value=''>Select Country</option>
                                <option value='Canada'>Canada</option>
                                <option value='Mexico'>Mexico</option>
                                <option value='United States'>United States</option>
                            </select>
                        </InputWrapper>
                        {/* <label htmlFor='country'>Country:</label>
                        <select name='country' id='country' onChange={(e) => this.setSettings({country: e.target.value})} defaultValue={this.initialSettings.country}>
                            
                        </select> */}
                    </div>

                    <div className='setting-child three-quarter'>
                        <InputWrapper label='Region'>
                            <RegionDropdown value={this.state.settings.region} country={this.state.settings.country} onChange={(e) => this.setSettings({region: e.target.value})}  />
                        </InputWrapper>
                        {/* <label htmlFor='region'>Region:</label> */}           
                    </div>

                    <div className='setting-child three-quarter'>
                        <InputWrapper label='City'>
                            <input type='text' onChange={(e) => this.setSettings({city: e.target.value})} defaultValue={this.state.settings.city} />
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