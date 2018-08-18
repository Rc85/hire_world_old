import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

class SubmitButton extends Component {
    render() {
        let loadingText = /loading$/;

        return(
            <button type='submit' className='submit-btn btn btn-primary mr-1' disabled={loadingText.test(this.props.loading) ? true : false}>
                {loadingText.test(this.props.loading)  ? <FontAwesomeIcon icon={faCircleNotch} spin /> : this.props.value }
            </button>
        )
    }
}

export default SubmitButton;