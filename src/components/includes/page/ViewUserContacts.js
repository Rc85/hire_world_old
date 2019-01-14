import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faPhone, faGraduationCap, faMapMarkedAlt, faMapMarkerAlt, faDollarSign, faCommentsDollar } from '@fortawesome/free-solid-svg-icons';
import { faListAlt, faBuilding } from '@fortawesome/free-regular-svg-icons';
import { UncontrolledTooltip } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import TitledContainer from '../../utils/TitledContainer';

const ViewUserContacts = props => {
    let email, phone, address, education, location, city, region, country, businessName;

    if (props.user) {
        if (props.user.user_email) {
            email = <div className='d-flex-center mb-2'><div className='text-center w-10 mr-1'><FontAwesomeIcon icon={faEnvelope} className='text-special' /></div><a href={`mailto: ${props.user.user_email}`}>{props.user.user_email}</a></div>
        }

        if (props.user.user_phone) {
            phone = <div className='d-flex-center mb-2'><div className='text-center w-10 mr-1'><FontAwesomeIcon icon={faPhone} className='text-special' /></div>{props.user.user_phone}</div>
        }

        if (props.user.user_address) {
            let city_code;

            if (props.user.user_city_code) {
                city_code = <span>, {props.user.user_city_code}</span>;
            }

            address = <div className='d-flex-center mb-2'><div className='text-center w-10 mr-1'><FontAwesomeIcon icon={faMapMarkedAlt} className='text-special' /></div>{props.user.user_address} {city_code}</div>
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
            location = <div className='d-flex-center mb-2'><div className='text-center w-10 mr-1'><FontAwesomeIcon icon={faMapMarkerAlt} className='text-special' /></div><span>{country} {region} {city}</span></div>
        }

        if (props.user.user_business_name) {
            businessName = <div className='d-flex-center mb-2'><div className='text-center w-10 mr-1'><FontAwesomeIcon icon={faBuilding} className='text-special mr-1' /></div> {props.user.user_website ? <a href={props.user.user_website}>{props.user.user_business_name}</a> : props.user.user_business_name}</div>;
        }
    }

    /* if (props.user.user_education) {
        education = <div className='d-flex-center mb-2'><div className='text-center w-10 mr-1'><FontAwesomeIcon icon={faGraduationCap} className='text-special' /></div> {props.user.user_education}</div>
    } */

    if (email || phone || address || education) {
        return(
            <TitledContainer title='Contact' mini shadow className='mb-5'>
                <div id='view-user-contacts'>
                    {/* education */}
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