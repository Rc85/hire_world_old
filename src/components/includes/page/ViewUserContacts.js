import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/pro-regular-svg-icons';
import { faPhone, faMapMarkedAlt, faMapMarkerAlt, faUserCircle } from '@fortawesome/pro-solid-svg-icons';
import { faBuilding } from '@fortawesome/pro-regular-svg-icons';
import TitledContainer from '../../utils/TitledContainer';

const ViewUserContacts = props => {
    let name, email, phone, address, education, location, city, region, country, businessName;

    if (props.user) {
        if (props.user.user_firstname && props.user.user_lastname) {
            name = <div className='d-flex-start mb-2'><div className='mr-1'><FontAwesomeIcon icon={faUserCircle} className='text-special' /></div><span className='view-user-contact-field'>{props.user.user_firstname + ' ' + props.user.user_lastname}</span></div>;
        }
        
        if (props.user.user_email) {
            email = <div className='d-flex-start mb-2'><div className='mr-1'><FontAwesomeIcon icon={faEnvelope} className='text-special' /></div><a className='view-user-contact-field' href={`mailto: ${props.user.user_email}`}>{props.user.user_email}</a></div>
        }

        if (props.user.user_phone) {
            phone = <div className='d-flex-start mb-2'><div className='mr-1'><FontAwesomeIcon icon={faPhone} className='text-special' /></div><span className='view-user-contact-field'><nobr>{props.user.user_phone}</nobr></span></div>
        }

        if (props.user.user_address) {
            let city_code;

            if (props.user.user_city_code) {
                city_code = <span>, {props.user.user_city_code}</span>;
            }

            address = <div className='d-flex-start mb-2'><div className='mr-1'><FontAwesomeIcon icon={faMapMarkedAlt} className='text-special' /></div><span className='view-user-contact-field'>{props.user.user_address} {city_code}</span></div>
        }

        if (props.user.user_city) {
            city = props.user.user_city;
        }

        if (props.user.user_region) {
            region = city ? <span>{props.user.user_region},</span> : props.user.user_region;
        }

        if (props.user.user_country) {
            country = region || city ? <span>{props.user.user_country},</span> : props.user.user_country;
        }

        if (city || region || country) {
            location = <div className='d-flex-start mb-2'><div className='mr-1'><FontAwesomeIcon icon={faMapMarkerAlt} className='text-special' /></div><span className='view-user-contact-field'>{country} {region} {city}</span></div>
        }

        if (props.user.user_business_name) {
            businessName = <div className='d-flex-start mb-2'><div className='mr-1'><FontAwesomeIcon icon={faBuilding} className='text-special mr-1' /></div> {props.user.user_website ? <a className='view-user-contact-field' href={props.user.user_website}>{props.user.user_business_name}</a> :<span className='view-user-contact-field'>{props.user.user_business_name}</span>}</div>;
        }
    }

    if (name || email || phone || address || businessName) {
        return(
            <TitledContainer title='Contact' mini shadow>
                <div id='view-user-contacts'>
                    {name}
                    {businessName}
                    {email}
                    {phone}
                    {address}
                    {location}
                </div>
            </TitledContainer>
        )
    }

    return null;
}

ViewUserContacts.propTypes = {
    user: PropTypes.object
}

export default ViewUserContacts;