import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputWrapper from '../../utils/InputWrapper';
import { connect } from 'react-redux';
import { isTyping } from '../../../actions/ConfigActions'
import TwoSidedCheckbox from '../../utils/TwoSidedCheckbox';
import TextArea from '../../utils/TextArea';

class HiringForm extends Component {
    render() {
        return (
            <React.Fragment>
                <div className='setting-field-container mb-3'>
                    <InputWrapper label='List Title' id='listing-title'>
                        <input type='text' value={this.props.newSettings.listing_title} onChange={(e) => this.props.setSetting('listing_title', e.target.value)} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                    </InputWrapper>

                    <InputWrapper label='List Under' id='listing-under'>
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
    
                <div className='d-flex-end-center mb-3'>
                    <TwoSidedCheckbox checkedText='Negotiable' uncheckedText='Non-negotiable' checked={this.props.newSettings.listing_negotiable} check={(bool) => this.props.setSetting('listing_negotiable', bool)} />
                </div>
    
                <TextArea label='Details' rows={10} className='mb-3' textAreaClassName='w-100' onChange={(val) => this.props.setSetting('listing_detail', val)} value={this.props.newSettings.listing_detail} />
            </React.Fragment>
        );
    }
}

HiringForm.propTypes = {

};

const mapStateToProps = state => {
    return {
        config: state.Config
    }
}

export default connect(mapStateToProps)(HiringForm);