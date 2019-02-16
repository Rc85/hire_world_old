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
    let avatar, bio;

    if (props.user) {
        avatar = <UserProfilePic url={props.user.avatar_url} editable={false}/>;
        name = props.user.username;

        if (props.user.user_firstname && props.user.user_lastname) {
            name = <span>{props.user.user_firstname} {props.user.user_lastname}</span>
        }
        
        bio = props.user.listing_detail;
    }

    return(
        <div id='view-user-profile' className='mb-3'>
            <div id='view-user-header'>
                <div id='view-user-header-info' className='mb-3'>
                    <div id='view-user-profile-pic'>
                        <div className='w-100 text-center'>
                            <div>{avatar}</div>
                        </div>
                    </div>
    
                    <div id='view-user-title'>
                        <h3>{props.user.user_title}</h3>
                        <div id='view-user-rating' className='mb-3'><UserRating rating={props.stats.rating || 0} /> ({props.stats.job_count})</div>

                        <div id='view-user-listing-info'>
                            <div className='d-flex-center mr-3 mb-1'>
                                <Tooltip text='Listed Under' placement='top'><FontAwesomeIcon icon={faListAlt} className='text-special mr-2' /></Tooltip> <NavLink to={`/sector/${props.user.listing_sector}`}>{props.user.listing_sector}</NavLink>
                            </div>

                            <div className='d-flex-center mr-3 mb-1'>
                                <Tooltip text='Asking Price' placement='top'><FontAwesomeIcon icon={faDollarSign} className='text-special mr-2' /></Tooltip> <nobr>{props.user.listing_price} / {props.user.listing_price_type} {props.user.listing_price_currency}</nobr>
                            </div>

                            <div className='d-flex-center mr-3 mb-1'>
                                <Tooltip text='Negotiable' placement='top'><FontAwesomeIcon icon={faCommentsDollar} className='text-special mr-2' /></Tooltip> {props.user.listing_negotiable ? <span className='mini-badge mini-badge-success'>Negotiable</span> : <span className='mini-badge mini-badge-secondary'>Non-negotiable</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div id='view-user-login-info'>
                    {props.stats.user_last_login ?
                    <div className='d-flex-between-center'>
                        <div className='mr-2'><strong>Last Login:</strong></div>
                        {moment(props.stats.user_last_login).format('MM-DD-YY @ hh:mm A')}
                    </div> : ''}
                </div>
            </div>

            <h4 className='d-flex-center'>{props.user.listing_title}</h4>

            {/* <div>{props.user.listing_remote ? <span className='mini-badge mini-badge-orange'>Remote</span> : ''} {props.user.listing_local ? <span className='mini-badge mini-badge-purple'>Local</span> : ''}</div> */}

            <hr/>
            
            <div id='view-user-details' className='mb-3'>{bio ? bio : ''}</div>

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