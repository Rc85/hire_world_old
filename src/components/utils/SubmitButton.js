import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

class SubmitButton extends Component {
    render() {
        let loadingCheck = /loading$/;

        return(
            <Button type={this.props.type} color='primary' className='mr-1' disabled={loadingCheck.test(this.props.loading) ? true : false} onClick={() => this.props.onClick()}>
                {loadingCheck.test(this.props.loading) ? <FontAwesomeIcon icon={faCircleNotch} spin /> : this.props.value }
            </Button>
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