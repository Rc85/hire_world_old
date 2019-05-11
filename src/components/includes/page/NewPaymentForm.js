import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputWrapper from '../../utils/InputWrapper';
import { connect } from 'react-redux';
import { IsTyping } from '../../../actions/ConfigActions';
import CreditCardInput from '../../utils/CreditCardInput';
import CCExpiryDateInput from '../../utils/CCExpiryDateInput';
import CVCInput from '../../utils/CVCInput';

class NewPaymentForm extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            ccFocused: false,
            ccExpFocused: false,
            cvcFocused: false
        }
    }

    handleFocus(type, bool) {
        let obj = {};
        obj[type] = bool;

        this.setState(obj);
        this.props.dispatch(IsTyping(bool));
    }
    
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

                <label><input type='checkbox' checked={this.props.defaultAddress} onChange={() => this.props.useDefaultAddress()} /> Same address as this account</label>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <CreditCardInput setRef={(el) => this.props.setCardRef(el)} />
                    </div>

                    <div className='setting-child quarter'>
                        <CCExpiryDateInput setRef={(el) => this.props.setExpRef(el)} />
                    </div>

                    <div className='setting-child quarter'>
                        <CVCInput setRef={(el) => this.props.setCvcRef(el)} />
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