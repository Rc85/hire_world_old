import React, { Component } from 'react';
import PropTypes from 'prop-types';

class InputGroup extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            focused: false
        }
    }

    handleParentFocus() {
        this.setState({focused: true})
    }

    handleParentBlur() {
        this.setState({focused: false});
    }

    handleParentClick(e) {
        e.preventDefault();
    }
    
    render() {
        return(
            <div id={this.props.id ? this.props.id : ''} className={`input-group-container ${this.props.className ? this.props.className : ''}`}>
                <div className={`input-container-header ${this.state.focused ? 'focused' : ''}`}>
                    <label className={`input-group-label ${!this.props.labelBgColor ? this.props.labelBgColor : 'bg-highlight'}`}>{this.props.label}</label>
                    {this.props.required ? <label className='required-label'><span className='text-special'>*</span></label> : ''}
                </div>

                <div onFocus={this.handleParentFocus.bind(this)} onBlur={this.handleParentBlur.bind(this)} className={`input-group ${this.props.style ? this.props.style : 'row'}`}>{this.props.children}</div>
            </div>
        )
    }
}

InputGroup.propTypes = {
    id: PropTypes.string,
    labelBgColor: PropTypes.string
};

export default InputGroup;