import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-regular-svg-icons';
import UserProfilePic from '../../includes/page/UserProfilePic';

const ViewUserProfile = user => {
    let avatar, firstName, lastName, businessName, title, bio;

    if (user.user) {
        avatar = <UserProfilePic url={user.user.avatar_url} editable={false}/>;

        if (user.user.user_title) {
            title = <div className='badge badge-info ml-1'>{user.user.user_title}</div>;
        }
        
        if (user.user.user_business_name) {
            businessName = <h4><FontAwesomeIcon icon={faBuilding} className='view-user-icon' /> {user.user.user_business_name}</h4>;
        }
        
        bio = user.user.user_bio;
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
                    <h1 className='d-flex'>{user.user.username}</h1>
                    <h4>{title}</h4>
                    {businessName}
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