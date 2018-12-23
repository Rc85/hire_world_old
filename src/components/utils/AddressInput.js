import React from 'react';
import PropTypes from 'prop-types';
import { RegionDropdown } from 'react-country-region-selector';

const AddressInput = props => {
    let saveable;
    
    if (props.saveable) {
        saveable = <div className='w-45'>
            <div>
                <label htmlFor='save-address' className='mb-0'><input type='checkbox' name='save-address' id='save-address' onClick={(e) => props.set('saveAddress', !props.info.saveAddress)} /> Save this address to your account</label>
            </div>
        </div>;
    }

    console.log(props);

    return(
        <div>
            <div className='d-flex-between-center mb-3'>
                <div className='w-45'>
                    <label htmlFor='address'>Address:</label>
                    <input type='text' name='address' id='address' className='form-control mb-3' onChange={(e) => props.set('address_line1', e.target.value)} value={props.info ? props.info.address_line1 : ''} />
                </div>

                <div className='w-45'>
                    <label htmlFor='country'>Country:</label>
                    <select name='country' id='country' className='form-control' onChange={(e) => props.set('address_country', e.target.value)} value={props.info && props.info.address_country ? props.info.address_country : ''}>
                        <option value=''>Select Country</option>
                        <option value='Canada'>Canada</option>
                        <option value='Mexico'>Mexico</option>
                        <option value='United States'>United States</option>
                    </select>
                </div>
            </div>

            <div className='d-flex-between-center mb-3'>
                <div className='w-45'>
                    <label htmlFor='region'>Region:</label>
                    <RegionDropdown value={props.info && props.info.address_state ? props.info.address_state : ''} country={props.info && props.info.address_country ? props.info.address_country : ''} onChange={(val) => props.set('address_state', val)} classes='form-control mb-3' />
                </div>

                <div className='w-45'>
                    <label htmlFor='city'>City:</label>
                    <input type='text' name='city' id='city' className='form-control mb-3' onChange={(e) => props.set('address_city', e.target.value)} value={props.info ? props.info.address_city : ''} />
                </div>
            </div>

            <div className='d-flex-between-center'>
                <div className='w-45'>
                    <label htmlFor='city_code'>Postal/Zip Code:</label>
                    <input type='text' name='city_code' id='city_code' className='form-control' onChange={(e) => props.set('address_zip', e.target.value)} value={props.info ? props.info.address_zip : ''} />
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