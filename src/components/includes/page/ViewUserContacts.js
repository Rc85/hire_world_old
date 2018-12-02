import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faPhone, faGraduationCap, faMapMarkedAlt, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';

const ViewUserContacts = user => {
    let email, phone, address, education, location, city, region, country;

    if (user.user.user_email) {
        email = <div className='d-flex-center mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faEnvelope} size='lg' className='view-user-icon' /></div><NavLink to={`mailto: ${user.user.user_email}`}>{user.user.user_email}</NavLink></div>
    }

    if (user.user.user_phone) {
        phone = <div className='d-flex-center mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faPhone} size='lg' className='view-user-icon' /></div>{user.user.user_phone}</div>
    }

    if (user.user.user_address) {
        let city_code;

        if (user.user.user_city_code) {
            city_code = <span>, {user.user.user_city_code}</span>;
        }

        address = <div className='d-flex-center mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faMapMarkedAlt} size='lg' className='view-user-icon' /></div>{user.user.user_address} {city_code}</div>
    }

    if (user.user.user_city) {
        city = user.user.user_city;
    }

    if (user.user.user_region) {
        region = city ? <span>{user.user.user_region},</span> : user.user.user_region;
    }

    if (user.user.user_country) {
        country = region || city ? <span>{user.user.user_country},</span> : user.user.user_country;
    }

    if (city || region || country) {
        location = <div className='d-flex-center mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faMapMarkerAlt} size='lg' className='view-user-icon' /></div><span>{country} {region} {city}</span></div>
    }    

    /* if (user.user.user_education) {
        education = <div className='d-flex-center mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faGraduationCap} className='view-user-icon' size='lg' /></div> {user.user.user_education}</div>
    } */

    if (email || phone || address || education) {
        return(
            <div id='view-user-contacts'>
                {/* education */}
                {email}
                {phone}
                {address}
                {location}
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