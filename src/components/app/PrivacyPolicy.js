import React from 'react';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/pro-solid-svg-icons';

const PrivacyPolicy = props => {
    return (
        <div>
            <section id='privacy' className='main-panel'>
                <TitledContainer title='Privacy Policy' icon={<FontAwesomeIcon icon={faFileAlt} />} shadow bgColor='primary'>
                    <h2 id='top'>Table of Contents</h2>

                    <div className='mb-3'><a href='#intro'>Introduction</a></div>
                    <div className='mb-3'><a href='#what'>What information do we collect and what are we doing with it</a></div>
                    <div className='mb-3'><a href='#why'>Why do we collect these information</a></div>
                    <div className='mb-3'><a href='#your-control'>Your control of your data</a></div>
                    <div className='mb-3'><a href='#our-control'>Our control of your data and your user account</a></div>
                    <div className='mb-3'><a href='#deleting'>Deleting your data from Hire World</a></div>

                    <hr/>

                    <h2 id='intro'>Introduction</h2>

                    <p>Hire World (<strong>"we"</strong>, <strong>"us"</strong>, <strong>"our"</strong>) wants to help you (<strong>"your"</strong>, <strong>"user"</strong>) understand how we use, collect, control, and share the data that you submit to us and via our services. This privacy policy (<strong>"policy"</strong>) applies to you for accessing and using our website and service(s).</p>

                    <div className='text-right'><a href='#top'>Top</a></div>

                    <hr/>

                    <h2 id='what'>What information do we collect and what are we doing with it</h2>

                    <p>The following list are data that we collect from you, whether temporarily and permanently:</p>

                    <ul>
                        <li>All the fields when registering an account with Hire World.</li>
                        <li>User's settings such as and not limited to, enabled/disabled email notifications and showing/hiding user information.</li>
                        <li>Cookies which contains a user's data that holds the user's session with our application.</li>
                        <li>Any content submitted to Hire World by its users such as and not limited to, reviews and messages.</li>
                        <li>Your social security number, financial information, and any information requested by <a href='https://stripe.com' rel='noopener noreferrer' target='_blank'>Stripe</a> will be required conducting business on our platform where you receive payments from <a href='https://stripe.com' rel='noopener noreferrer' target='_blank'>Stripe</a>.</li>
                    </ul>

                    <p>We do not share your personal information with any other party other than <a href='https://stripe.com' rel='noopener noreferrer' target='_blank'>Stripe</a>.</p>

                    <div className='text-right'><a href='#top'>Top</a></div>

                    <hr/>

                    <h2 id='why'>Why do we collect these information</h2>

                    <p>Hire World offers a service that helps users find work offered by other users, vice versa. As a result of this, some personal information is important to ensure that you are a legitimate user and that we and other users can identify you. All the necessary information that we collect helps us provide features and better service to you. We will never use the information you provide to us, other than your email to contact you with notices, promotions, or advertisements of any kind. We will never directly call you on the phone number provided. We will never send mail to the address you provided.</p>

                    <div className='text-right'><a href='#top'>Top</a></div>

                    <hr/>

                    <h2 id='your-control'>Your control of your data</h2>

                    <p>Hire World offers options in your account settings to show or hide your information. Some information does not have this option as we feel these information are required to identify you as a user. We also offer the options to modify and delete information other than your username, first name, last name, country and region. These information are required in order to keep the account in our database and these information does not specifically identify you and are related to you.</p>

                    <p>The control of you your data is solely your responsibility on whom you share it with. When contacted or in contact with Hire World's owner, support, agents, employees, and/or administrators, we will never ask for your password.</p>

                    <div className='text-right'><a href='#top'>Top</a></div>

                    <hr/>

                    <h2 id='our-control'>Our control of your data and your user account</h2>

                    <p>Hire World may change or modify your data if we feel the data you submit is inappropriate and/or inaccurate in any way.</p>

                    <p>Hire World may delete your user account entirely for whatever reason we feel is justifiable by us, with or without notice to you.</p>

                    <p>Hire World may transfer your data to another server for reasons such as and not limited to, data back-up and server migration, with or without notice to you.</p>

                    <p>Hire World may disclose your data to public authorities to the extent demanded by law.</p>

                    <div className='text-right'><a href='#top'>Top</a></div>

                    <hr/>

                    <h2 id='deleting'>Deleting your account from Hire World</h2>

                    <p>At Hire World, we do not delete accounts mainly because deleting the account can affect a user's reputation, wether positively or negatively. You give you the control to delete the data related to your account such as your email and address. However, your username, first name, last name, country and region remains on the account. You may request to change the first name and last name of the account any time by contacting our support and upon providing information which verifies that you are the owner of the account, we will change it per your request.</p>

                    <div className='text-right'><a href='#top'>Top</a></div>
                </TitledContainer>
            </section>
        </div>
    );
}


export default PrivacyPolicy;