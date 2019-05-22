import React from 'react';
import TitledContainer from '../components/utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/pro-solid-svg-icons';

const PrivacyPolicy = props => {
    return (
        <div>
            <section id='privacy' className='main-panel'>
                <TitledContainer title='Privacy Policy' icon={<FontAwesomeIcon icon={faFileAlt} />} shadow bgColor='primary'>
                    <h2 id='top' className='mb-3'>Table of Contents</h2>

                    <div className='mb-1'><a href='#intro'>Introduction</a></div>
                    <div className='mb-1'><a href='#what'>What information do we collect and what are we doing with it</a></div>
                    <div className='mb-1'><a href='#why'>Why do we collect these information</a></div>
                    <div className='mb-1'><a href='#your-control'>Your control of your data</a></div>
                    <div className='mb-1'><a href='#our-control'>Our control of your data and your user account</a></div>
                    <div className='mb-1'><a href='#deleting'>Deleting your data from Hire World</a></div>

                    <hr/>

                    <h2 id='intro'>Introduction</h2>

                    <p>Hire World (<strong>"we"</strong>, <strong>"us"</strong>, <strong>"our"</strong>) wants to help you (<strong>"your"</strong>, <strong>"user"</strong>) understand how we use, collect, control, and share the data that you submit to us and via our services. This privacy policy (<strong>"policy"</strong>) applies to you for accessing and using our website and service(s). If you do not agree with any terms set out in this privacy policy, you are prohibited from accessing our website and using our service(s).</p>

                    <div className='text-right'><a href='#top'>Top</a></div>

                    <hr/>

                    <h2 id='what'>What information do we collect and what are we doing with it</h2>

                    <p>The following list are data that we collect from you, whether temporarily and permanently:</p>

                    <ul>
                        <li>All the fields when registering an account with Hire World.</li>
                        <li>User's settings such as and not limited to, enabled/disabled email notifications and showing/hiding personal information.</li>
                        <li>Cookies which contains a user's data that holds the user's session with our application.</li>
                        <li>Any content submitted to Hire World by its users such as and not limited to, reviews and messages.</li>
                        <li>Any data requested by <a href='https://stripe.com' rel='noopener noreferrer' target='_blank'>Stripe</a> will be required when using our Link Work service where funds will be transferred within your <a href='https://stripe.com' rel='noopener noreferrer' target='_blank'>Stripe</a> connected account.</li>
                        <li>Any data specified in Google's <a href='https://policies.google.com/privacy' rel='noopener noreferer' target='_blank'>Privacy Policy</a> and <a href='https://policies.google.com/terms' rel='noopener noreferer' target='_blank'>Terms of Service</a> will be required when you are prompt to verify that you are a legitimate user.</li>
                    </ul>

                    <p>We do not share your personal information with any other party other than <a href='https://stripe.com' rel='noopener noreferrer' target='_blank'>Stripe</a> and <a href='https://google.ca'>Google</a>.</p>

                    <div className='text-right'><a href='#top'>Top</a></div>

                    <hr/>

                    <h2 id='why'>Why do we collect these information</h2>

                    <p>Hire World offers a service that helps users find work offered by other users, vice versa. As a result of this, some personal information is important to ensure that you are a legitimate user and that we and other users can identify you. All the necessary information that we collect helps us provide features and better service to you. We will never use the information you provide to us for purposes other than to email you regarding account changes, promotions, or advertisements. We will never directly call you on the phone number provided. We will never send physical mail to the address provided.</p>

                    <div className='text-right'><a href='#top'>Top</a></div>

                    <hr/>

                    <h2 id='your-control'>Your control of your data</h2>

                    <p>Hire World offers options in your account settings to show or hide your information. Some information does not have this option as we feel these information are required to identify you as a user. We also offer the options to modify and delete information other than your username and email as these are necessary information to help us prevent repetitive account creations.</p>

                    <p>The control of you your data is solely your responsibility on whom you share it with. When contacted or in contact with Hire World's owner, support, agents, employees, and/or administrators, we will never ask for your password. We may, however, attempt to identify you as the account owner by asking you to verify the information on your account.</p>

                    <div className='text-right'><a href='#top'>Top</a></div>

                    <hr/>

                    <h2 id='our-control'>Our control of your data and your user account</h2>

                    <p>Hire World reserve the rights to change or modify your data if we feel the data you submit is inappropriate and/or inaccurate in any way.</p>

                    <p>Hire World reserve the rights to delete your user account entirely for whatever reason we feel is justifiable by us with or without notice to you or to the extent demanded by law.</p>

                    <p>Hire World reserve the rights to transfer your data to another server for reasons such as and not limited to, data back-up and server migration, with or without notice to you.</p>

                    <p>Hire World reserve the rights to disclose your data to public authorities to the extent demanded by law.</p>

                    <div className='text-right'><a href='#top'>Top</a></div>

                    <hr/>

                    <h2 id='deleting'>Deleting your account from Hire World</h2>

                    <p>At Hire World, we do not allow the option to delete accounts mainly because deleting the account can affect a user's reputation, wether positively or negatively. You can choose to close your account as you wish and we will flag the account as "Closed". Closed account will not appear in our profile directory. However, your reviews of other users will remain visible to other users.</p>

                    <p>If you wish to exercise your rights to be forgotten, in other words, deleting your account from our database, you can send us a request by email. Our support will verify that you are the account owner and upon successful verification, we will delete your account as per your request.</p>

                    <div className='text-right'><a href='#top'>Top</a></div>
                </TitledContainer>
            </section>
        </div>
    );
}


export default PrivacyPolicy;