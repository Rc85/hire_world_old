import React, { Component } from 'react';
import PropTypes from 'prop-types';

class TwoSidedCheckbox extends Component {
    check(bool) {
        if (!this.props.disabled) {
            this.props.check(bool);
        }
    }

    render() {
        return (
            <div className={`two-sided-checkbox-container ${this.props.disabled ? 'disabled' : ''}`}>
                <div className={`first-side-checkbox ${this.props.checked ? 'checked' : ''}`} onClick={() => this.check(true)}>{this.props.checkedText}</div>
                <div className={`second-side-checkbox ${!this.props.checked ? 'checked' : ''}`} onClick={() => this.check(false)}>{this.props.uncheckedText}</div>
            </div>
        );
    }
}

TwoSidedCheckbox.propTypes = {

};

export default TwoSidedCheckbox;