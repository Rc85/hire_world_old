import React from 'react';
import PropTypes from 'prop-types';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import InputWrapper from '../../utils/InputWrapper';
import { IsTyping } from '../../../actions/ConfigActions';
import { connect } from 'react-redux';

const AddressInput = props => {
    let saveable;
    
    if (props.saveable) {
        saveable = <div className='setting-child'>
            <label htmlFor='save-address'><input type='checkbox' name='save-address' id='save-address' onClick={(e) => props.set('saveAddress', !props.info.saveAddress)} /> Save this address to your account</label>
        </div>;
    }

    return(
        <div className='mb-3'>
            <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='Address Line 1' required={props.required}>
                        <input type='text' name='address' id='address' onChange={(e) => props.set('address_line1', e.target.value)} value={props.info && props.info.address_line1 ? props.info.address_line1 : ''} onFocus={() => props.dispatch(IsTyping(true))} onBlur={() => props.dispatch(IsTyping(false))} required={props.required} />
                    </InputWrapper>
                </div>

                <div className='setting-child'>
                    <InputWrapper label='Address Line 2'>
                        <input type='text' name='address' id='address' onChange={(e) => props.set('address_line2', e.target.value)} value={props.info && props.info.address_line2 ? props.info.address_line2 : ''} onFocus={() => props.dispatch(IsTyping(true))} onBlur={() => props.dispatch(IsTyping(false))} />
                    </InputWrapper>
                </div>
            </div>

            <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='Country' required={props.required}>
                        <CountryDropdown value={props.info.address_country || ''} onChange={(val) => props.set('address_country', val)} valueType='short' required={props.required} />
                    </InputWrapper>
                </div>
                <div className='setting-child'>
                    <InputWrapper label='Region' required={props.required}><RegionDropdown value={props.info && props.info.address_state ? props.info.address_state : ''} country={props.info && props.info.address_country ? props.info.address_country : ''} onChange={(val) => props.set('address_state', val)} countryValueType='short' valueType='short' required={props.required} /></InputWrapper>
                </div>
            </div>

            <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='City' required={props.required}><input type='text' name='city' id='city' onChange={(e) => props.set('address_city', e.target.value)} value={props.info && props.info.address_city ? props.info.address_city : ''} onFocus={() => props.dispatch(IsTyping(true))} onBlur={() => props.dispatch(IsTyping(false))} required={props.required} /></InputWrapper>
                </div>

                <div className='setting-child'>
                    <InputWrapper label='Postal/Zip Code' required={props.required}><input type='text' name='city_code' id='city_code' onChange={(e) => props.set('address_zip', e.target.value)} value={props.info && props.info.address_zip ? props.info.address_zip : ''} onFocus={() => props.dispatch(IsTyping(true))} onBlur={() => props.dispatch(IsTyping(false))} required={props.required} /></InputWrapper>
                </div>
            </div>

            {saveable}
        </div>
    )
}

AddressInput.propTypes = {
    saveable: PropTypes.bool.isRequired,
    info: PropTypes.object,
    set: PropTypes.func
};

export default connect()(AddressInput);