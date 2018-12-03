import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

const ViewUserSocialMedia = props => {
    let github, facebook, twitter, instagram, linkedin, website;
    
    if (props.user.user_github) {
        github = <div className='ml-3'><a href={props.user.user_github}><FontAwesomeIcon icon={faGithub} size='lg' /></a></div>;
    }
    
    if (props.user.user_facebook) {
        facebook = <div className='ml-3'><a href={props.user.user_facebook}><FontAwesomeIcon icon={faFacebook} size='lg' /></a></div>;
    }
    
    if (props.user.user_twitter) {
        twitter = <div className='ml-3'><a href={props.user.user_twitter}><FontAwesomeIcon icon={faTwitter} size='lg' /></a></div>;
    }
    
    if (props.user.user_instagram) {
        instagram = <div className='ml-3'><a href={props.user.user_instagram}><FontAwesomeIcon icon={faInstagram} size='lg' /></a></div>;
    }
    
    if (props.user.user_linkedin) {
        linkedin = <div className='ml-3'><a href={props.user.user_linkedin}><FontAwesomeIcon icon={faLinkedin} size='lg' /></a></div>;
    }
    
    if (props.user.user_website) {
        website = <div className='ml-3'><a href={props.user.user_website}><FontAwesomeIcon icon={faGlobe} size='lg' /></a></div>;
    }
    
    if (github || facebook || twitter || instagram || linkedin || website) {
        return(
            <div id='view-user-social-media' className='d-flex-end-center'>
                {github}
                {facebook}
                {twitter}
                {instagram}
                {linkedin}
                {website}
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