import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

class SubmitButton extends Component {
    render() {
        let loadingCheck = /loading$/;

        return(
            <button type={this.props.type} className='submit-btn btn btn-primary mr-1' disabled={loadingCheck.test(this.props.loading) ? true : false} onClick={() => this.props.onClick()}>
                {loadingCheck.test(this.props.loading) ? <FontAwesomeIcon icon={faCircleNotch} spin /> : this.props.value }
            </button>
        )
    }
}

SubmitButton.propTypes = {
    type: PropTypes.oneOf(['submit', 'button']).isRequired,
    value: PropTypes.string.isRequired,
    loading: PropTypes.string.isRequired,
    onClick: PropTypes.func
}

export default SubmitButton;