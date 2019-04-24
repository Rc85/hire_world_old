import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
import PropTypes from 'prop-types';

export default class SubmitButton extends Component {
    onClick() {
        if (this.props.type === 'button') {
            this.props.onClick();
        }
    }

    render() {
        let value = 'Submit';

        if (this.props.value) {
            value = this.props.value;
        }

        return(
            <button type={this.props.type ? this.props.type : 'submit'} id={this.props.id} className={`btn btn-${this.props.bgColor ? this.props.bgColor : 'primary'} ${this.props.className ? this.props.className : ''}`} disabled={this.props.loading || this.props.disabled} onClick={() => this.onClick()}>
                {this.props.loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : value }
            </button>
        )
    }
}

SubmitButton.propTypes = {
    type: PropTypes.oneOf([
        'submit', 'button'
    ]),
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    loading: PropTypes.bool,
    onClick: PropTypes.func,
    disabled: PropTypes.bool
}