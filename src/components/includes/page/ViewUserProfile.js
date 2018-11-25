import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-regular-svg-icons';
import UserProfilePic from '../../includes/page/UserProfilePic';

const ViewUserProfile = props => {
    console.log(props.user)
    let avatar, bio, name;

    if (props.user) {
        avatar = <UserProfilePic url={props.user.avatar_url} editable={false}/>;
        name = props.user.username;

        if (props.user.user_firstname && props.user.user_lastname) {
            name = <span>{props.user.user_firstname} {props.user.user_lastname}</span>
        }
        
        bio = props.user.user_bio;
    }

    return(
        <div id='view-user-profile' className='mb-3'>
            <div className='d-flex'>
                <div className='w-10'>
                    <div className='w-90 text-center'>
                        <div>{avatar}</div>
                    </div>
                </div>

                <div id='view-user-title'>
                    <h1 className='d-flex'>{name}</h1>
                    <h5>{props.user.user_title}</h5>
                </div>
            </div>

            {bio ? <React.Fragment><hr/><div id='view-user-details' className='rounded'>{bio}</div><hr/></React.Fragment> : ''}
        </div>
    )
}

ViewUserProfile.propTypes = {
    user: PropTypes.object
}

export default ViewUserProfile;