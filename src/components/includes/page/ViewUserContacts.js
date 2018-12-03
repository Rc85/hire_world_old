import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faPhone, faGraduationCap, faMapMarkedAlt, faMapMarkerAlt, faDollarSign, faCommentsDollar } from '@fortawesome/free-solid-svg-icons';
import { faListAlt, faBuilding } from '@fortawesome/free-regular-svg-icons';
import { UncontrolledTooltip } from 'reactstrap';
import { NavLink } from 'react-router-dom';

const ViewUserContacts = props => {
    let email, phone, address, education, location, city, region, country, businessName;

    if (props.user.user_email) {
        email = <div className='d-flex-center mb-3'><div className='text-center w-10 mr-1'><FontAwesomeIcon icon={faEnvelope} size='lg' className='view-user-icon' /></div><a href={`mailto: ${props.user.user_email}`}>{props.user.user_email}</a></div>
    }

    if (props.user.user_phone) {
        phone = <div className='d-flex-center mb-3'><div className='text-center w-10 mr-1'><FontAwesomeIcon icon={faPhone} size='lg' className='view-user-icon' /></div>{props.user.user_phone}</div>
    }

    if (props.user.user_address) {
        let city_code;

        if (props.user.user_city_code) {
            city_code = <span>, {props.user.user_city_code}</span>;
        }

        address = <div className='d-flex-center mb-3'><div className='text-center w-10 mr-1'><FontAwesomeIcon icon={faMapMarkedAlt} size='lg' className='view-user-icon' /></div>{props.user.user_address} {city_code}</div>
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
        location = <div className='d-flex-center mb-3'><div className='text-center w-10 mr-1'><FontAwesomeIcon icon={faMapMarkerAlt} size='lg' className='view-user-icon' /></div><span>{country} {region} {city}</span></div>
    }

    if (props.user.user_business_name) {
        businessName = <div className='d-flex-center mb-3'><div className='text-center w-10 mr-1'><FontAwesomeIcon icon={faBuilding} className='view-user-icon mr-1' size='lg' /></div> {props.user.user_website ? <a href={props.user.user_website}>{props.user.user_business_name}</a> : props.user.user_business_name}</div>;
    }

    /* if (props.user.user_education) {
        education = <div className='d-flex-center mb-3'><div className='text-center w-10 mr-1'><FontAwesomeIcon icon={faGraduationCap} className='view-user-icon' size='lg' /></div> {props.user.user_education}</div>
    } */

    if (email || phone || address || education) {
        return(
            <div id='view-user-contacts'>
                <div className='d-flex-center mb-3'>
                    <div className='text-center w-10 mr-1'>
                        <FontAwesomeIcon icon={faListAlt} id='user-listed-under' className='view-user-icon' size='lg' />
                        <UncontrolledTooltip placement='top' target='user-listed-under' delay={{show: 0, hide: 0}}>Listed Under</UncontrolledTooltip>
                    </div>
                    <NavLink to={`/sector/${props.user.listing_sector}`}>{props.user.listing_sector}</NavLink>
                </div>

                <div className='d-flex-center mb-3'>
                    <div className='text-center w-10 mr-1'>
                        <FontAwesomeIcon icon={faDollarSign} id='user-list-price' className='view-user-icon' size='lg' />
                        <UncontrolledTooltip placement='top' target='user-list-price' delay={{show: 0, hide: 0}}>Asking Price</UncontrolledTooltip>
                    </div>
                    ${props.user.listing_price} / {props.user.listing_price_type} {props.user.listing_price_currency}
                </div>

                <div className='d-flex-center mb-3'>
                    <div className='text-center w-10 mr-1'>
                        <FontAwesomeIcon icon={faCommentsDollar} id='list-negotiable' className='view-user-icon' size='lg' />
                        <UncontrolledTooltip placement='top' target='list-negotiable' delay={{show: 0, hide: 0}}>Negotiable</UncontrolledTooltip>
                    </div>
                    {props.user.listing_negotiable ? 'Yes' : 'No'}
                </div>

                <hr/>
                {/* education */}
                {businessName}
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