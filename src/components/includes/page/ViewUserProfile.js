import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import UserProfilePic from '../../includes/page/UserProfilePic';
import UserRating from './UserRating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faCommentsDollar } from '@fortawesome/free-solid-svg-icons';
import { faListAlt } from '@fortawesome/free-regular-svg-icons';
import Tooltip from '../../utils/Tooltip';
import { NavLink } from 'react-router-dom';
import ViewUserSocialMedia from './ViewUserSocialMedia';

const ViewUserProfile = props => {
    let avatar, bio, price;

    if (props.user) {
        avatar = <UserProfilePic url={props.user.avatar_url} editable={false}/>;
        name = props.user.username;

        if (props.user.user_firstname && props.user.user_lastname) {
            name = <span>{props.user.user_firstname} {props.user.user_lastname}</span>
        }
        
        bio = props.user.listing_detail;
    }

    if (props.user.listing_price_type === 'To Be Discussed') {
        price = <div className='view-user-listing-info-child'><Tooltip text='Asking Price' placement='top'><FontAwesomeIcon icon={faDollarSign} className='text-special mr-2' /></Tooltip> <nobr>{props.user.listing_price_type}</nobr></div>;
    } else {
        if (props.user.listing_price !== '0') {
            price = <React.Fragment>
                <div className='view-user-listing-info-child'>
                    <Tooltip text='Asking Price' placement='top'><FontAwesomeIcon icon={faDollarSign} className='text-special mr-2' /></Tooltip> <nobr>{props.user.listing_price} / {props.user.listing_price_type} {props.user.listing_price_currency}</nobr>
                </div>

                <div className='view-user-listing-info-child'>
                    <Tooltip text='Negotiable' placement='top'><FontAwesomeIcon icon={faCommentsDollar} className='text-special mr-2' /></Tooltip> {props.user.listing_negotiable ? <span className='mini-badge mini-badge-success'>Negotiable</span> : <span className='mini-badge mini-badge-secondary'>Non-negotiable</span>}
                </div>
            </React.Fragment>;
        }
    }

    return(
        <div id='view-user-profile' className='mb-3'>
            <div id='view-user-header'>
                <div id='view-user-header-info' className='mb-3'>
                    <div id='view-user-profile-pic'> 
                        {avatar}     
                    </div>
    
                    <div id='view-user-title'>
                        <div className='view-user-title-child'>
                            <h3>{props.user.user_title}</h3>
                            {props.user.connected_acct_status === 'Approved' ? <div className='connected-status mini-badge mini-badge-success'>Connected</div> : ''}
                        </div>

                        <div id='view-user-rating' className='view-user-title-child'><UserRating rating={props.stats.rating || 0} /> ({props.stats.job_count})</div>

                        <div id='view-user-listing-info' className='view-user-title-child'>
                            <div className='view-user-listing-info-child'>
                                <Tooltip text='Listed Under' placement='top'><FontAwesomeIcon icon={faListAlt} className='text-special mr-2' /></Tooltip> <NavLink to={`/sector/${props.user.listing_sector}`}>{props.user.listing_sector}</NavLink>
                            </div>

                            {price}
                        </div>

                        <div className='view-user-listing-location view-user-title-child'>
                            {props.user.listing_local ? <span className='mini-badge mini-badge-orange'>Local</span> : ''}
                            {props.user.listing_online ? <span className='mini-badge mini-badge-purple'>Online</span> : ''}
                            {props.user.listing_remote ? <span className='mini-badge mini-badge-green'>Remote</span> : ''}
                        </div>
                    </div>
                </div>
            </div>

            <h4 className='view-user-title-wrapper'>
                <div className='view-user-listing-title'>{props.user.listing_title}</div>
            </h4>

            {/* <div>{props.user.listing_remote ? <span className='mini-badge mini-badge-orange'>Remote</span> : ''} {props.user.listing_local ? <span className='mini-badge mini-badge-purple'>Local</span> : ''}</div> */}

            <hr/>
            
            <div id='view-user-listing-details' className='mb-3'>{bio ? bio : ''}</div>

            <div className='text-right'>
                <ViewUserSocialMedia user={props.user} />
            </div>
        </div>
    )
}

ViewUserProfile.propTypes = {
    user: PropTypes.object
}

export default ViewUserProfile;