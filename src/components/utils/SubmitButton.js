import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

class SubmitButton extends Component {
    render() {
        return(
            <button type={this.props.type} className='btn btn-primary mr-1' disabled={this.props.loading} onClick={() => this.props.onClick()}>
                {this.props.loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : this.props.value }
            </button>
        )
    }
}

SubmitButton.propTypes = {
    type: PropTypes.oneOf(['submit', 'button']).isRequired,
    value: PropTypes.string.isRequired,
    loading: PropTypes.bool,
    onClick: PropTypes.func
}

export default SubmitButton;