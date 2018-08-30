import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

const ViewUserSocialMedia = user => {
    let github, facebook, twitter, instagram, linkedin, website;

    if (user.user.user_github) {
        github = <div className='mb-3'><FontAwesomeIcon icon={faGithub} className='view-user-icon' size='lg' /> <a href={user.user.user_github}>Github</a></div>;
    }

    if (user.user.user_facebook) {
        facebook = <div className='mb-3'><FontAwesomeIcon icon={faFacebook} className='view-user-icon' size='lg' /> <a href={user.user.user_facebook}>Facebook</a></div>;
    }

    if (user.user.user_twitter) {
        twitter = <div className='mb-3'><FontAwesomeIcon icon={faTwitter} className='view-user-icon' size='lg' /> <a href={user.user.user_twitter}>Twitter</a></div>;
    }

    if (user.user.user_instagram) {
        instagram = <div className='mb-3'><FontAwesomeIcon icon={faInstagram} className='view-user-icon' size='lg' /> <a href={user.user.user_instagram}>Instagram</a></div>;
    }

    if (user.user.user_linkedin) {
        linkedin = <div className='mb-3'><FontAwesomeIcon icon={faLinkedin} className='view-user-icon' size='lg' /> <a href={user.user.user_linkedin}>LinkedIn</a></div>;
    }

    if (user.user.user_website) {
        website = <div className='mb-3'><FontAwesomeIcon icon={faGlobe} className='view-user-icon' size='lg' /> <a href={user.user.user_website}>Website</a></div>
    }

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

ViewUserSocialMedia.propTypes = {
    user: PropTypes.object
}

export default ViewUserSocialMedia;