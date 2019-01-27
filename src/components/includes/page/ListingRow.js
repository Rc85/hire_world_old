import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import UserRating from './UserRating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faDollarSign, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle, faClock } from '@fortawesome/free-regular-svg-icons';
import moment from 'moment';
import UserProfilePic from '../page/UserProfilePic';
import Tooltip from '../../utils/Tooltip';

const ListingRow = props => {
    let purpose;

    if (props.listing.listing_purpose === 'For Hire') {
        purpose = <span className='mini-badge mini-badge-purple'>For Hire</span>
    } else if (props.listing.listing_purpose === 'Hiring') {
        purpose = <span className='mini-badge mini-badge-orange'>Hiring</span>
    }

    return(
        <div className='listing-row mb-3'>
            <div className='listing-row-main'>
                <div className='listing-row-profile-pic'><UserProfilePic url={props.listing.avatar_url} square /></div>

                <div className='listing-row-title' title={props.listing.listing_title}><NavLink to={`/user/${props.listing.listing_user}`}>{props.listing.listing_title}</NavLink></div>

                <div className='listing-row-purpose'>{purpose}</div>

                <div className='listing-row-rating'>
                    <UserRating rating={props.listing.rating} /> ({props.listing.review_count ? props.listing.review_count : 0})
                </div>
            </div>

            <div className='listing-row-detail'>
                <div className='listing-row-detail-child'>
                    <FontAwesomeIcon icon={faUserCircle} className='text-special mr-1' /> {props.listing.listing_user} ({props.listing.user_title})
                </div>

                <div className='listing-row-detail-child'>
                    <FontAwesomeIcon icon={faClock} className='text-special mr-1' /> {moment(props.listing.listing_created_date).format('MMM DD YYYY')}
                </div>

                <div className='listing-row-detail-child'>
                    <FontAwesomeIcon icon={faDollarSign} className='mr-1' /> {props.listing.listing_price} / {props.listing.listing_price_type} {props.listing.listing_price_currency}
                </div>

                <div className='listing-row-detail-child'>
                    <FontAwesomeIcon icon={faCheckCircle} className='text-success mr-1' /> <strong>{props.listing.job_complete}</strong> {parseInt(props.listing.job_complete) === 1 ? 'Job' : 'Jobs'} completed
                </div>

                <div className='listing-row-buttons'>
                    <Tooltip text='Report this user' placement='left'><FontAwesomeIcon icon={faExclamationTriangle} className='text-highlight' size='sm' /></Tooltip>
                </div>
            </div>
        </div>
    )
}

ListingRow.propTypes = {
    listing: PropTypes.object.isRequired
};

export default ListingRow;