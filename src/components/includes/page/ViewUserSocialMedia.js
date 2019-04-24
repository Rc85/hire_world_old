import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';
import { faGlobe } from '@fortawesome/pro-solid-svg-icons';

const ViewUserSocialMedia = props => {
    let github, facebook, twitter, instagram, linkedin, website;
    
    if (props.user.user_github) {
        github = <div><a href={props.user.user_github} rel='noopener noreferrer' target='_blank'><FontAwesomeIcon icon={faGithub} size='lg' /></a></div>;
    }
    
    if (props.user.user_facebook) {
        facebook = <div><a href={props.user.user_facebook} rel='noopener noreferrer' target='_blank'><FontAwesomeIcon icon={faFacebook} size='lg' /></a></div>;
    }
    
    if (props.user.user_twitter) {
        twitter = <div><a href={props.user.user_twitter} rel='noopener noreferrer' target='_blank'><FontAwesomeIcon icon={faTwitter} size='lg' /></a></div>;
    }
    
    if (props.user.user_instagram) {
        instagram = <div><a href={props.user.user_instagram} rel='noopener noreferrer' target='_blank'><FontAwesomeIcon icon={faInstagram} size='lg' /></a></div>;
    }
    
    if (props.user.user_linkedin) {
        linkedin = <div><a href={props.user.user_linkedin} rel='noopener noreferrer' target='_blank'><FontAwesomeIcon icon={faLinkedin} size='lg' /></a></div>;
    }
    
    if (props.user.user_website) {
        website = <div><a href={props.user.user_website} rel='noopener noreferrer' target='_blank'><FontAwesomeIcon icon={faGlobe} size='lg' /></a></div>;
    }
    
    if (github || facebook || twitter || instagram || linkedin || website) {
        return(
            <div id='view-user-social-media'>
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
    user: PropTypes.object
}

export default ViewUserSocialMedia;