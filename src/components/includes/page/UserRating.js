import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarInactive } from '@fortawesome/free-regular-svg-icons';

const UserRating = props => {
    if (props.rating >= 0) {
        return( 
            <React.Fragment>
                <FontAwesomeIcon icon={faStar} className={props.rating >= 1 ? 'user-review-star active' : 'user-review-star'} />
                <FontAwesomeIcon icon={faStar} className={props.rating >= 2 ? 'user-review-star active' : 'user-review-star'} />
                <FontAwesomeIcon icon={faStar} className={props.rating >= 3 ? 'user-review-star active' : 'user-review-star'} />
                <FontAwesomeIcon icon={faStar} className={props.rating >= 4 ? 'user-review-star active' : 'user-review-star'} />
                <FontAwesomeIcon icon={faStar} className={props.rating >= 5 ? 'user-review-star active' : 'user-review-star'} />
                {/*{props.rating >= 1 ? <FontAwesomeIcon icon={faStar} className='user-review-star' /> : <FontAwesomeIcon icon={faStarInactive} className='user-review-star' /> }
                {props.rating >= 2 ? <FontAwesomeIcon icon={faStar} className='user-review-star' /> : <FontAwesomeIcon icon={faStarInactive} className='user-review-star' /> }
                {props.rating >= 3 ? <FontAwesomeIcon icon={faStar} className='user-review-star' /> : <FontAwesomeIcon icon={faStarInactive} className='user-review-star' /> }
                {props.rating >= 4 ? <FontAwesomeIcon icon={faStar} className='user-review-star' /> : <FontAwesomeIcon icon={faStarInactive} className='user-review-star' /> }
                {props.rating >= 5 ? <FontAwesomeIcon icon={faStar} className='user-review-star' /> : <FontAwesomeIcon icon={faStarInactive} className='user-review-star' /> } */}
            </React.Fragment>
        )
    }

    return null;
}

UserRating.propTypes = {
    rating: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])
}

export default UserRating;