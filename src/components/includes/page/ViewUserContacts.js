import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faPhone, faGraduationCap } from '@fortawesome/free-solid-svg-icons';

const ViewUserContacts = user => {
    let email, phone, address, education;

    if (user.user.user_email) {
        email = <div className='mb-3'><FontAwesomeIcon icon={faEnvelope} size='lg' className='view-user-icon' /> <a href={`mailto: ${user.user.user_email}`}>{user.user.user_email}</a></div>
    }

    if (user.user.user_phone) {
        phone = <div className='mb-3'><FontAwesomeIcon icon={faPhone} size='lg' className='view-user-icon' /> {user.user.user_phone}</div>
    }

    if (user.user.user_address) {
        address = <div className='mb-3 view-user-address'>{user.user.user_address}</div>
    }

    if (user.user.user_education) {
        education = <div className='mb-3'><FontAwesomeIcon icon={faGraduationCap} className='view-user-icon' size='lg' /> {user.user.user_education}</div>
    }

    console.log(user);
    return(
        <div id='view-user-contacts'>
            {education}
            {email}
            {phone}
            {address}
            <hr/>
        </div>
    )
}

ViewUserContacts.propTypes = {
    user: PropTypes.object
}

export default ViewUserContacts;