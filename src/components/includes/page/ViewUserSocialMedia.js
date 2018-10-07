import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import { faListAlt } from '@fortawesome/free-regular-svg-icons';

const ViewUserSocialMedia = props => {
    let github, facebook, twitter, instagram, linkedin, website, listing;

    if (props.listing.status === 'Active') {
        listing = <React.Fragment><div className='d-flex mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faListAlt} className='view-user-icon' size='lg' /></div> <NavLink to={`/listing/${props.listing.id}`}>Listed</NavLink></div><hr/></React.Fragment>;
    }

    if (props.user.user_github) {
        github = <div className='d-flex mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faGithub} className='view-user-icon' size='lg' /></div> <a href={props.user.user_github}>Github</a></div>;
    }

    if (props.user.user_facebook) {
        facebook = <div className='d-flex mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faFacebook} className='view-user-icon' size='lg' /></div> <a href={props.user.user_facebook}>Facebook</a></div>;
    }

    if (props.user.user_twitter) {
        twitter = <div className='d-flex mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faTwitter} className='view-user-icon' size='lg' /></div> <a href={props.user.user_twitter}>Twitter</a></div>;
    }

    if (props.user.user_instagram) {
        instagram = <div className='d-flex mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faInstagram} className='view-user-icon' size='lg' /></div> <a href={props.user.user_instagram}>Instagram</a></div>;
    }

    if (props.user.user_linkedin) {
        linkedin = <div className='d-flex mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faLinkedin} className='view-user-icon' size='lg' /></div> <a href={props.user.user_linkedin}>LinkedIn</a></div>;
    }

    if (props.user.user_website) {
        website = <div className='d-flex mb-3'><div className='w-10 mr-1'><FontAwesomeIcon icon={faGlobe} className='view-user-icon' size='lg' /></div> <a href={props.user.user_website}>Website</a></div>
    }

    if (github || facebook || twitter || instagram || linkedin || website) {
        return(
            <div id='view-user-social-media'>
                {listing}
                {github}
                {facebook}
                {twitter}
                {instagram}
                {linkedin}
                {website}
                <hr/>
            </div>
        )
    }

    return null;
}

ViewUserSocialMedia.propTypes = {
    user: PropTypes.object,
    listing: PropTypes.object
}

export default ViewUserSocialMedia;