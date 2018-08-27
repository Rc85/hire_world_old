import React, { Component } from 'react';
import '../../../styles/ViewUserContacts.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';

class ViewUserContacts extends Component {
    render() {
        return(
            <div id='view-user-contacts'>
                <div><FontAwesomeIcon icon={faGithub} className='user-contact-icon' size='lg' /> Github</div>
                <div><FontAwesomeIcon icon={faFacebook} className='user-contact-icon' size='lg' /> Facebook</div>
                <div><FontAwesomeIcon icon={faTwitter} className='user-contact-icon' size='lg' /> Twitter</div>
                <div><FontAwesomeIcon icon={faInstagram} className='user-contact-icon' size='lg' /> Instagram</div>
                <div><FontAwesomeIcon icon={faLinkedin} className='user-contact-icon' size='lg' /> LinkedIn</div>
            </div>
        )
    }
}

export default ViewUserContacts;