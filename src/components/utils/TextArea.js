import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IsTyping } from '../../actions/ConfigActions';

class TextArea extends Component {
    render() {
        return(
            <div id={this.props.id} className={`text-area-container ${this.props.className ? this.props.className : ''}`}>
                {this.props.label ? <label>{this.props.label}</label> : ''}

                <textarea
                id={this.props.textAreaId ? this.props.textAreaId : ''}
                className={this.props.textAreaClassName ? this.props.textAreaClassName : ''}
                rows={this.props.rows ? this.props.rows : 6}
                onChange={(e) => this.props.onChange(e.target.value)}
                onFocus={() => this.props.dispatch(IsTyping(true))}
                onBlur={() => this.props.dispatch(IsTyping(false))}
                disabled={this.props.disabled}
                autoFocus={this.props.autoFocus}
                placeholder={this.props.placeholder}
                defaultValue={this.props.defaultValue}
                value={this.props.value}
                required={this.props.required}></textarea>
            </div>
        )
    }
}

TextArea.propTypes = {
    value: PropTypes.string
}

export default connect()(TextArea);