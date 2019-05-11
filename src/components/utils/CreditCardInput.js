import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputWrapper from './InputWrapper';
import { CardNumberElement } from 'react-stripe-elements';
import { IsTyping } from '../../actions/ConfigActions';
import { connect } from 'react-redux';

class CreditCardInput extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            focused: false
        }
    }

    handleFocus(bool) {
        this.setState({focused: bool});
        this.props.dispatch(IsTyping(true));
    }

    setRef() {
        this.props.setRef(this.CardNumberElement)
    }
    
    render() {
        return (
            <InputWrapper label='Credit Card Number' required className='pl-1 pb-1 pr-1' focused={this.state.focused}>
                <CardNumberElement className='w-100' onReady={el => this.CardNumberElement = el} onFocus={this.handleFocus.bind(this, true)} onBlur={this.handleFocus.bind(this, false)} ref={this.setRef.bind(this)} />
            </InputWrapper>
        );
    }
}

CreditCardInput.propTypes = {

};

export default connect()(CreditCardInput);