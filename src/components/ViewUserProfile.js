import React from 'react';
import PropTypes from 'prop-types';
import UserProfilePic from './UserProfilePic';
import UserRating from './UserRating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faCommentsDollar, faThList } from '@fortawesome/pro-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import ViewUserSocialMedia from './ViewUserSocialMedia';
import { faCommentAltDollar } from '@fortawesome/pro-solid-svg-icons';
import MoneyFormatter from './utils/MoneyFormatter';

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
        price = <div className='view-user-listing-info-child'><FontAwesomeIcon icon={faDollarSign} className='text-special mr-1' /> <nobr>{props.user.listing_price_type}</nobr></div>;
    } else {
        if (props.user.listing_price !== '0') {
            price = <React.Fragment>
                <div className='view-user-listing-info-child'>
                    <FontAwesomeIcon icon={faCommentAltDollar} className='text-special mr-1' /> <nobr>$<MoneyFormatter value={props.user.listing_price} /> / {props.user.listing_price_type} {props.user.listing_price_currency}</nobr>
                </div>

                <div className='view-user-listing-info-child'>
                    <FontAwesomeIcon icon={faCommentsDollar} className='text-special mr-1' /> {props.user.listing_negotiable ? <span className='mini-badge mini-badge-success'>Negotiable</span> : <span className='mini-badge mini-badge-secondary'>Non-negotiable</span>}
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
                        <div className='view-user-title-container'>
                            <h3 className='mr-1'>{props.user.user_title}</h3>
                            {props.user.link_work_acct_status === 'Approved' ? <div className='linked-status mini-badge mini-badge-success'>Linked</div> : ''}
                        </div>

                        <div id='view-user-rating' className='mb-3'><UserRating rating={props.stats.rating || 0} /> ({props.stats.job_count})</div>

                        <div id='view-user-listing-info' className='mb-3'>
                            <div className='view-user-listing-info-child'>
                                <FontAwesomeIcon icon={faThList} className='text-special mr-1' /> <NavLink to={`/sector/${props.user.listing_sector}`}>{props.user.listing_sector}</NavLink>
                            </div>

                            {price}
                        </div>

                        <div className='view-user-listing-location mb-3'>
                            {props.user.listing_local ? <span className='mini-badge mini-badge-orange mr-1'>Local</span> : ''}
                            {props.user.listing_online ? <span className='mini-badge mini-badge-purple mr-1'>Link Work</span> : ''}
                            {props.user.listing_remote ? <span className='mini-badge mini-badge-green mr-1'>Remote</span> : ''}
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