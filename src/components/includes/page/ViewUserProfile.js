import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-regular-svg-icons';
import UserProfilePic from '../../includes/page/UserProfilePic';

const ViewUserProfile = user => {
    let avatar, name, businessName, title, bio;

    if (user.user) {
        avatar = <UserProfilePic url={user.user.avatar_url} editable={false}/>;
        title = <span className='badge badge-secondary'>{user.user.user_title}</span>;
        businessName = user.user.business_name;
        bio = user.user.user_bio;
    }

    if (user.user.user_firstname && user.user.user_lastname) {
        name = <span className='mr-2'>{user.user.user_firstname} {user.user.user_lastname}</span>;
    } else {
        name = user.user.username;
    }

    return(
        <div id='view-user-profile' className='mb-3'>
            <div className='d-flex'>
                <div className='w-10 mr-2'>{avatar}</div>

                <div id='view-user-title'>
                    <div className='d-flex align-items-start'>
                        <h1 className='d-flex'>
                            {name}
                        </h1>
    
                        <h4>{title}</h4>
                    </div>
    
                    <h4><FontAwesomeIcon icon={faBuilding} className='view-user-icon' /> {businessName}</h4>
                </div>
            </div>

            <hr/>

            <div id='view-user-details' className='rounded'>
                {bio}
            </div>

            <hr/>
        </div>
    )
}

ViewUserProfile.propTypes = {
    user: PropTypes.object
}

export default ViewUserProfile;