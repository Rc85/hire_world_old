import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReviewButtonTooltip from './ReviewButtonTooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCommentDots } from '@fortawesome/free-solid-svg-icons';

class ReviewButton extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showTooltip: false
        }
    }
    
    render() {
        let tooltip;

        if (this.props.reviewed) {
            if (this.state.showTooltip) {
                tooltip = <ReviewButtonTooltip text='Reviewed' />
            }

            return (
                <div className='review-button-container'>
                    {tooltip}
                    <button title='Reviewed' id='reviewed-button' className='btn btn-success btn-sm mr-1 disabled' onMouseOver={() => this.setState({showTooltip: true})} onMouseOut={() => this.setState({showTooltip: false})}><FontAwesomeIcon icon={faCheck} /></button>
                </div>
            )
        } else {
            if (this.state.showTooltip) {
                tooltip = <ReviewButtonTooltip text='Submit a Review' />
            }

            return (
                <div className='review-button-container'>
                    {tooltip}
                    <button title='Submit a Review' className='btn btn-info btn-sm mr-1' onClick={() => this.props.review()} onMouseOver={() => this.setState({showTooltip: true})} onMouseOut={() => this.setState({showTooltip: false})}><FontAwesomeIcon icon={faCommentDots} /></button>
                </div>
            )
        }
    }
}

ReviewButton.propTypes = {

};

export default ReviewButton;