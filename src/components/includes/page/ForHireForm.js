import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputWrapper from '../../utils/InputWrapper';
import { connect } from 'react-redux';
import { isTyping } from '../../../actions/ConfigActions'
import TwoSidedCheckbox from '../../utils/TwoSidedCheckbox';
import TextArea from '../../utils/TextArea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';

class ForHireForm extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            location: [],
            country: '',
            region: '',
            city: ''
        }
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props.newSettings.listing_location_of_work) !== JSON.stringify(nextProps.newSettings.listing_location_of_work)) {
            this.setState({location: nextProps.newSettings.listing_location_of_work});
        }
    }
    
    setLocationOfWork(val) {
        let location = [...this.state.location];

        if (val === 'Geo' && location.indexOf('Geo') < 0) {
            location = [val];
        } else if (val === 'Geo' && location.indexOf('Geo') >= 0) {
            location = [];
        } else {
            let index = location.indexOf('Geo');
            
            if (index >= 0) {
                location.splice(index, 1);
            }

            if (location.indexOf(val) >= 0) {
                let index = location.indexOf(val);
                location.splice(index, 1);
            } else if (location.indexOf(val) < 0) {
                location.push(val);
            }
        }

        this.props.setSetting('listing_location_of_work', location);
    }
    
    render() {
        (this.state.location);
         let locationInput;

         if (this.state.location.indexOf('Geo') >= 0) {
             locationInput = <div className='setting-field-container mb-3'>
                <InputWrapper label='Country' required className='w-100'>
                    <CountryDropdown value={this.state.country} onChange={(val) => this.setState({country: val})} />
                </InputWrapper>

                <InputWrapper label='Region' className='w-100'>
                    <RegionDropdown value={this.state.region} country={this.state.country} onChange={(val) => this.setState({region: val})} />
                </InputWrapper>

                <InputWrapper label='City' className='w-100'>
                    <input type='text' onChange={(e) => this.setState({city: e.target.value})} />
                </InputWrapper>

                <button className='btn btn-primary'>Add</button>
             </div>
         }

        return (
            <React.Fragment>
                <div className='setting-field-container mb-3'>
                    <InputWrapper label='List Title' id='listing-title' required>
                        <input type='text' value={this.props.newSettings.listing_title} onChange={(e) => this.props.setSetting('listing_title', e.target.value)} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                    </InputWrapper>

                    <InputWrapper label='Location of Work' id='listing-location' required>
                        <div className='checkbox-label-container'>
                            <label className={`checkbox-label ${this.state.location.indexOf('Remote') >= 0 ? 'active' : ''}`}><input type='checkbox' value='Remote' onChange={(e) => this.setLocationOfWork(e.target.value)} checked={this.state.location.indexOf('Remote') >= 0} /> <div className='checkbox-container'><div className='checkbox'>{this.state.location.indexOf('Remote') >= 0 ? <FontAwesomeIcon icon={faCheck} /> : ''}</div> <span className='checkbox-label-text'>Remote</span></div></label>
    
                            <label className={`checkbox-label ${this.state.location.indexOf('Local') >= 0 ? 'active' : ''}`}><input type='checkbox' value='Local' onChange={(e) => this.setLocationOfWork(e.target.value)} checked={this.state.location.indexOf('Local') >= 0} /> <div className='checkbox-container'><div className='checkbox'>{this.state.location.indexOf('Local') >= 0 ? <FontAwesomeIcon icon={faCheck} /> : ''}</div> <span className='checkbox-label-text'>Local</span></div></label>
    
                            <label className={`checkbox-label ${this.state.location.indexOf('Geo') >= 0 ? 'active' : ''}`}><input type='checkbox' value='Geo' onChange={(e) => this.setLocationOfWork(e.target.value)} checked={this.state.location.indexOf('Geo') >= 0} /> <div className='checkbox-container'><div className='checkbox'>{this.state.location.indexOf('Geo') >= 0 ? <FontAwesomeIcon icon={faCheck} /> : ''}</div> <span className='checkbox-label-text'>I will specify...</span></div></label>
                        </div>
                    </InputWrapper>
                </div>
    
                <div className='mb-3'>
                    <InputWrapper label='List Under' required>
                        <select onChange={(e) => this.props.setSetting('listing_sector', e.target.value)} value={this.props.newSettings.listing_sector}>{this.props.sectors}</select>
                    </InputWrapper>
                </div>
    
                <div className='setting-field-container mb-3'>
                    <InputWrapper label='Price Rate' id='listing-price'>
                        <input type='number' onChange={(e) => this.props.setSetting('listing_price', e.target.value)} value={this.props.newSettings.listing_price} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                    </InputWrapper>
    
    
                    <InputWrapper label='Per' id='listing-price-type' required>
                        <select onChange={(e) => this.props.setSetting('listing_price_type', e.target.value)} value={this.props.newSettings.listing_price_type}>
                            <option value='Hour'>Hour</option>
                            <option value='Bi-weekly'>Bi-weekly</option>
                            <option value='Month'>Month</option>
                            <option value='Delivery'>Delivery</option>
                            <option value='One Time Payment'>One Time Payment</option>
                        </select>
                    </InputWrapper>
    
                    <InputWrapper label='Currency' id='listing-price-currency' required>
                        <input type='text' onChange={(e) => this.props.setSetting('listing_price_currency', e.target.value)} value={this.props.newSettings.listing_price_currency} list='currency-list' onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                        <datalist id='currency-list'>
                            <option value='USD'>USD</option>
                            <option value='CAD'>CAD</option>
                            <option value='AUD'>AUD</option>
                            <option value='EUR'>EUR</option>
                            <option value='GBP'>GBP</option>
                        </datalist>
                    </InputWrapper>
                </div>

                {locationInput}
    
                <div className='d-flex-end-center mb-3'>
                    <TwoSidedCheckbox checkedText='Negotiable' uncheckedText='Non-negotiable' checked={this.props.newSettings.listing_negotiable} check={(bool) => this.props.setSetting('listing_negotiable', bool)} />
                </div>
    
                <TextArea label='Details' rows={10} className='mb-3' textAreaClassName='w-100' onChange={(val) => this.props.setSetting('listing_detail', val)} value={this.props.newSettings.listing_detail} />
            </React.Fragment>
        );
    }
}

ForHireForm.propTypes = {

};

const mapStateToProps = state => {
    return {
        config: state.Config,
        
    }
}

export default connect(mapStateToProps)(ForHireForm);