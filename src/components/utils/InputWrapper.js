import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class InputWrapper extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            parentFocused: false
        }
    }

    handleParentFocus() {
        this.setState({parentFocused: true})
    }

    handleParentBlur() {
        this.setState({parentFocused: false});
    }

    handleParentClick(e) {
        if (e.target.className === 'checkbox-label-text') {
            e.preventDefault();
        }
    }

    render() {
        return(
            <div onFocus={this.handleParentFocus.bind(this)} onBlur={this.handleParentBlur.bind(this)} onMouseDown={this.handleParentClick.bind(this)} id={this.props.id} className={`input-container ${this.props.className ? this.props.className : ''} ${this.props.disabled ? 'disabled' : ''} ${this.state.focused ? '' : ''}`}>
                <div className={`input-container-header ${this.state.parentFocused || this.props.focused ? 'focused' : ''}`}>
                    <label className={`${this.props.labelBgColor ? `bg-${this.props.labelBgColor}` : ''}`}>{this.props.label}</label>
                    {this.props.altLabel ? <label className={`alt-label ${this.props.altLabelClassName ? this.props.altLabelClassName : ''}`}>{this.props.altLabel}</label> : ''}
                    {this.props.required ? <label className='required-label'><span className='text-special'>*</span></label> : ''}
                </div>
    
                {this.props.children}
            </div>
        )
    }
}

InputWrapper.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    labelBgColor: PropTypes.string
};

export default connect()(InputWrapper);