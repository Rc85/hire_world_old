import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/UserReviewRating.css';

class UserReviewRating extends Component {
    render() {
        return(
            <div className='review-rating'>
                <div className='review-rating-rated'><FontAwesomeIcon icon={faStar} size='sm' /></div>
                <div className='review-rating-rated'><FontAwesomeIcon icon={faStar} size='sm' /></div>
                <div className='review-rating-rated'><FontAwesomeIcon icon={faStar} size='sm' /></div>
                <div className='review-rating-unrated'><FontAwesomeIcon icon={faStar} size='sm' /></div>
                <div className='review-rating-unrated'><FontAwesomeIcon icon={faStar} size='sm' /></div>
            </div>
        )
    }
}

export default UserReviewRating;