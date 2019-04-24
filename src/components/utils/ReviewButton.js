import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tooltip from './Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCommentDots } from '@fortawesome/pro-solid-svg-icons';

class ReviewButton extends Component {
    render() {
        if (this.props.reviewed) {
            return (
                <Tooltip text='Reviewed' placement='top-right'>
                    <div className='review-button-container'>
                        <button id='reviewed-button' className='btn btn-success btn-sm' disabled><FontAwesomeIcon icon={faCheck} /></button>
                    </div>
                </Tooltip>
            )
        } else {
            return (
                <Tooltip text='Submit a Job Complete Verified review' placement='top-right'>
                    <div className='review-button-container'>
                        <button title='Submit a Review' className='btn btn-info btn-sm' onClick={() => this.props.review()}><FontAwesomeIcon icon={faCommentDots} /></button>
                    </div>
                </Tooltip>
            )
        }
    }
}

ReviewButton.propTypes = {
    review: PropTypes.func,
    reviewed: PropTypes.bool
};

export default ReviewButton;