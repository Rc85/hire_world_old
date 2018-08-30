import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-regular-svg-icons';

const ViewUserProfile = user => {
    let name, businessName, title, bio;

    if (user.user.user_firstname && user.user.user_lastname) {
        name = <span className='mr-2'>{user.user.user_firstname} {user.user.user_lastname}</span>;
    } else {
        name = user.user.username;
    }

    if (user.user.user_title) {
        title = <span className='badge badge-secondary'>{user.user.user_title}</span>;
    }

    if (user.user.business_name) {
        businessName = user.user.business_name;
    }

    if (user.user.user_bio) {
        bio = user.user.user_bio;
    }

    return(
        <div id='view-user-profile' className='mb-3'>
            <div id='view-user-title'>
                <div className='d-flex align-items-start'>
                    <h1 className='d-flex'>
                        {name}
                    </h1>

                    <h4>{title}</h4>
                </div>

                <h4><FontAwesomeIcon icon={faBuilding} className='view-user-icon' /> {businessName}</h4>
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