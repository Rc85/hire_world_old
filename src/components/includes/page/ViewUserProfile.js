import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import UserProfilePic from '../../includes/page/UserProfilePic';
import UserRating from './UserRating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { UncontrolledTooltip } from 'reactstrap';

const ViewUserProfile = props => {
    console.log(props.user)
    let avatar, bio, name;

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
            <div className='d-flex-between-start mb-3'>
                <div className='d-flex w-75'>
                    <div className='w-10 mr-3'>
                        <div className='w-100 text-center'>
                            <div>{avatar}</div>
                        </div>
                    </div>
    
                    <div id='view-user-title'>
                        <h1 className='d-flex mb-0'>{name}</h1>
                        <h5 className='mb-0'>{props.user.user_title}</h5>
                        <div className='w-40'><UserRating rating={props.stats.rating || 0} /></div>
                    </div>
                </div>

                <div>
                    {props.stats.user_last_login ?
                    <div className='d-flex-between-center'>
                        <div className='mr-2'><strong>Last Login</strong></div>
                        {moment(props.stats.user_last_login).format('MM-DD-YY @ hh:mm A')}
                    </div> : ''}
                </div>
            </div>

            <div className='d-flex'>
                <div className='mr-5'>
                    <FontAwesomeIcon icon={faCheckCircle} className='text-success mr-2' id='job-success' />
                    <UncontrolledTooltip placement='top' target='job-success' delay={{show: 0, hide: 0}}>Job Completed</UncontrolledTooltip>
                    <span>{props.stats.job_complete}</span>
                </div>
    
                <div className='mr-5'>
                    <FontAwesomeIcon icon={faTimesCircle} className='text-danger mr-2' id='job-abandon' />
                    <UncontrolledTooltip placement='top' target='job-abandon' delay={{show: 0, hide: 0}}>Job Abandoned</UncontrolledTooltip>
                    <span>{props.stats.job_abandon}</span>
                </div>

                <div className='mr-5'>
                    <FontAwesomeIcon icon={faEye} id='user-views' className='mr-2' />
                    <UncontrolledTooltip placement='top' target='user-views' delay={{show: 0, hide: 0}}>Views</UncontrolledTooltip>
                    <span>{props.stats.view_count}</span>
                </div>
            </div>

            <hr/>

            {bio ? <React.Fragment><div id='view-user-details' className='rounded'>{bio}</div></React.Fragment> : ''}
        </div>
    )
}

ViewUserProfile.propTypes = {
    user: PropTypes.object
}

export default ViewUserProfile;