import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputWrapper from '../../utils/InputWrapper';
import { connect } from 'react-redux';
import { IsTyping } from '../../../actions/ConfigActions';
import { CardNumberElement, CardExpiryElement, CardCVCElement, injectStripe } from 'react-stripe-elements';

class NewPaymentForm extends Component {
    render() {
        return (
            <React.Fragment>
                <div className='setting-child payment-icons'>
                    <img src='/images/powered_by_stripe.png' className='payment-icon mr-1' />
                    <img src='/images/payment_methods.png' className='payment-icon' />
                </div>

                <div className='setting-child mb-3'>
                    <InputWrapper label='Name on Card'><input type='text' onChange={(e) => this.props.name(e.target.value)} autoComplete='ccname' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} placeholder='Your name on your profile will be used if left blank' /></InputWrapper>
                </div>

                <label><input type='checkbox' checked={this.props.defaultAddress} onChange={() => this.props.useDefaultAddress()} /> Use address registered with this account</label>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Credit Card Number' required className='pl-1 pb-1 pr-1'><CardNumberElement className='w-100' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} /></InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='Expiry Date' required className='pl-1 pb-1 pr-1'><CardExpiryElement className='w-100' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} /></InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
                        <InputWrapper label='CVC' required className='pl-1 pb-1 pr-1'><CardCVCElement className='w-100' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} /></InputWrapper>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

NewPaymentForm.propTypes = {
    name: PropTypes.func,
    useDefaultAddress: PropTypes.func,
    defaultAddress: PropTypes.bool
};

export default connect()(NewPaymentForm);