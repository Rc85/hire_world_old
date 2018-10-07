import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faPhone, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';

const ViewUserContacts = user => {
    let email, phone, address, education;

    if (user.user.user_email) {
        email = <div className='d-flex mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faEnvelope} size='lg' className='view-user-icon' /></div> <NavLink to={`mailto: ${user.user.user_email}`}>{user.user.user_email}</NavLink></div>
    }

    if (user.user.user_phone) {
        phone = <div className='d-flex mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faPhone} size='lg' className='view-user-icon' /></div> {user.user.user_phone}</div>
    }

    if (user.user.user_address) {
        address = <div className='mb-3 view-user-address'>{user.user.user_address}</div>
    }

    if (user.user.user_education) {
        education = <div className='d-flex mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faGraduationCap} className='view-user-icon' size='lg' /></div> {user.user.user_education}</div>
    }

    if (email || phone || address || education) {
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

    return null;
}

ViewUserContacts.propTypes = {
    user: PropTypes.object
}

export default ViewUserContacts;