import React, { Component } from 'react';
import InputWrapper from './InputWrapper';
import { CardExpiryElement } from 'react-stripe-elements';
import { IsTyping } from '../../actions/ConfigActions';
import { connect } from 'react-redux';

class CCExpiryDateInput extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            focused: false
        }
    }

    handleFocus(bool) {
        this.setState({focused: bool});
        this.props.dispatch(IsTyping(bool));
    }

    setRef() {
        if (this.props.setRef) {
            this.props.setRef(this.CardExpiryElement)
        }
    }

    render() {
        return (
            <InputWrapper label='Expiry Date' required className='pl-1 pb-1 pr-1' focused={this.state.focused}>
                <CardExpiryElement className='w-100' onReady={el => this.CardExpiryElement = el} onFocus={this.handleFocus.bind(this, true)} onBlur={this.handleFocus.bind(this, false)} ref={this.setRef.bind(this)} />
            </InputWrapper>
        );
    }
}

export default connect()(CCExpiryDateInput);