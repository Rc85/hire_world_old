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
    let price;

    if (props.listing.listing_price_type === 'To Be Discussed') {
        price = <React.Fragment><FontAwesomeIcon icon={faDollarSign} className='mr-1' /> {props.listing.listing_price_type}</React.Fragment>;
    } else {
        if (props.listing.listing_price !== '0') {
            price = <React.Fragment><FontAwesomeIcon icon={faDollarSign} className='mr-1' /> {props.listing.listing_price} / {props.listing.listing_price_type} {props.listing.listing_price_currency}</React.Fragment>;
        }
    }

    return(
        <div className='listing-row mb-3'>
            <div className='listing-row-profile-pic'><UserProfilePic url={props.listing.avatar_url} square /></div>

            <div className='listing-row-wrapper'>
                <div className='listing-row-main'>
                    <NavLink to={`/user/${props.listing.listing_user}`}>
                        <div className='listing-row-title' title={props.listing.listing_title}>   
                            <span>{props.listing.listing_title}</span>
                        </div>
        
                        <div className='listing-row-rating'>
                            <UserRating rating={props.listing.rating} /> <span>({props.listing.review_count ? props.listing.review_count : 0})</span>
                        </div>
                    </NavLink>
                </div>
    
                <div className='listing-row-detail'>
                    <div className='listing-row-detail-child'>
                        <FontAwesomeIcon icon={faUserCircle} className='text-special mr-1' /> {props.listing.listing_user} ({props.listing.user_title})
                        {props.listing.connected_acct_status === 'Approved' ? <div className='connected-status mini-badge mini-badge-success ml-1'>Connected</div> : ''}
                    </div>
    
                    <div className='listing-row-detail-child'>
                        <FontAwesomeIcon icon={faClock} className='text-special mr-1' /> {moment(props.listing.listing_created_date).format('MMM DD YYYY')}
                    </div>
    
                    <div className='listing-row-detail-child'>
                        {price}
                    </div>
    
                    <div className='listing-row-detail-child'>
                        <FontAwesomeIcon icon={faCheckCircle} className='text-success mr-1' /> <strong>{props.listing.job_complete}</strong> {parseInt(props.listing.job_complete) === 1 ? 'Job' : 'Jobs'} completed
                    </div>
                </div>
            </div>
        </div>
    )
}

ListingRow.propTypes = {
    listing: PropTypes.object.isRequired
};

export default ListingRow;