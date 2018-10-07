import React from 'react';
import PropTypes from 'prop-types';

const ReviewButtonTooltip = props => {
    return(
        <div className='review-button-tooltip-container'>
            <div className='position-relative'>
                <div className='review-button-tooltip'><small>{props.text}</small></div>
    
                <div className='review-button-tooltip-arrow'></div>
            </div>
        </div>
    )
}

ReviewButtonTooltip.propTypes = {
    
};

export default ReviewButtonTooltip;