import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

export default class SubmitButton extends Component {
    render() {
        let value = 'Submit';

        if (this.props.value) {
            value = this.props.value;
        }

        return(
            <button type={this.props.type} className='btn btn-primary mr-1' disabled={this.props.loading || this.props.disabled} onClick={() => this.props.onClick()}>
                {this.props.loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : value }
            </button>
        )
    }
}

SubmitButton.propTypes = {
    type: PropTypes.oneOf(['submit', 'button']).isRequired,
    value: PropTypes.string,
    loading: PropTypes.bool,
    onClick: PropTypes.func,
    disabled: PropTypes.bool
}