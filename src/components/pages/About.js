import React from 'react';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

const About = props => {
    return (
        <section id='about' className='main-panel'>
            <TitledContainer title='About' icon={<FontAwesomeIcon icon={faGlobe} />} shadow>
                <div className='simple-container no-bg mb-5'>
                    <div className='simple-container-title'>Mission</div>

                    <p>Provide a centralized platform for users' services, business, and profile to be listed in a searchable directory. We want to isolate these categories away from the major search engines so that these categories aren't mixed in with irrelevant search results. We want our users to have a definitive place to for their businesses and a definitive place to find them. We want to provide users a safe, trusted, and reliable place to conduct their business.</p>
                </div>

                <div className='simple-container no-bg mb-5'>
                    <div className='simple-container-title'>Values</div>

                    <p>At HireWorld, top quality service to our users is number one priority and we expect users to treat and respect each other as if they would to people in their real life. Each user's profile act as a business and identity to the user and it is important not to make false claims, defamation, and/or fraud against the user. Our support and management team are always on stand by to handle and investigate issues reported by our users. We believe that, a quick response and solution plays an important role in customer satisfaction.</p>
                </div>

                <div className='simple-container no-bg mb-5'>
                    <div className='simple-container-title'>Vision</div>

                    <p>We seek to continuously implement and provide services that will help assist users in getting their job done in the most efficient way. Ideas and possibilities are endless and we're throwing them on the drawing board on a daily basis. There are so many plans on the horizon, we hope for our users' support to grow our user base so that we can continue to provide a secure and reliable service to our users.</p>
                </div>
            </TitledContainer>
        </section>
    );
}

export default About;