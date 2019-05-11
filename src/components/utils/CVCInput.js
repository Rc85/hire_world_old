import React, { Component } from 'react';
import InputWrapper from './InputWrapper';
import { CardCVCElement } from 'react-stripe-elements';
import { IsTyping } from '../../actions/ConfigActions';
import { connect } from 'react-redux';

class CVCInput extends Component {
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
        this.props.setRef(this.CardCVCElement)
    }

    render() {
        return (
            <InputWrapper label='CVC' required className='pl-1 pb-1 pr-1' focused={this.state.focused}>
                <CardCVCElement className='w-100' onReady={el => this.CardCVCElement = el} onFocus={this.handleFocus.bind(this, true)} onBlur={this.handleFocus.bind(this, false)} ref={this.setRef.bind(this)} />
            </InputWrapper>
        );
    }
}

export default connect()(CVCInput);