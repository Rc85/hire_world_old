import React from 'react';
import PropTypes from 'prop-types';
import { RegionDropdown } from 'react-country-region-selector';
import InputWrapper from '../../utils/InputWrapper';

const AddressInput = props => {
    let saveable;
    
    if (props.saveable) {
        saveable = <div className='w-45'>
            <div>
                <label htmlFor='save-address' className='mb-0'><input type='checkbox' name='save-address' id='save-address' onClick={(e) => props.set('saveAddress', !props.info.saveAddress)} /> Save this address to your account</label>
            </div>
        </div>;
    }

    return(
        <div className='mb-3'>
            <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='Address'>
                        <input type='text' name='address' id='address' onChange={(e) => props.set('address_line1', e.target.value)} value={props.info ? props.info.address_line1 : ''} />
                    </InputWrapper>
                </div>

                <div className='setting-child'>
                    <InputWrapper label='Country'>
                        <select name='country' id='country' onChange={(e) => props.set('address_country', e.target.value)} value={props.info && props.info.address_country ? props.info.address_country : ''}>
                            <option value=''>Select Country</option>
                            <option value='Canada'>Canada</option>
                            <option value='Mexico'>Mexico</option>
                            <option value='United States'>United States</option>
                        </select>
                    </InputWrapper>
                </div>
            </div>

            <div className='setting-field-container mb-3'>
                <div className='setting-child'>
                    <InputWrapper label='Region'><RegionDropdown value={props.info && props.info.address_state ? props.info.address_state : ''} country={props.info && props.info.address_country ? props.info.address_country : ''} onChange={(val) => props.set('address_state', val)} /></InputWrapper>
                </div>

                <div className='setting-child'>
                    <InputWrapper label='City'><input type='text' name='city' id='city' onChange={(e) => props.set('address_city', e.target.value)} value={props.info ? props.info.address_city : ''} /></InputWrapper>
                </div>
            </div>

            <div className='setting-field-container center'>
                <div className='setting-child'>
                    <InputWrapper label='Postal/Zip Code'><input type='text' name='city_code' id='city_code' onChange={(e) => props.set('address_zip', e.target.value)} value={props.info ? props.info.address_zip : ''} /></InputWrapper>
                </div>

                {saveable}
            </div>
        </div>
    )
}

AddressInput.propTypes = {
    saveable: PropTypes.bool.isRequired,
    info: PropTypes.object,
    set: PropTypes.func
};

export default AddressInput;