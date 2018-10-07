import React, { Component } from 'react';
import UserInfo from '../includes/page/UserInfo';
import UserDetails from '../includes/page/UserDetails';
import { NavLink } from 'react-router-dom';
import UserProfilePic from '../includes/page/UserProfilePic';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import UserTitle from '../includes/page/UserTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-regular-svg-icons';

class EditUser extends Component {
    render() {
        let userTitleStatus, userEducationStatus, userGithubStatus, userTwitterStatus, userFacebookStatus, userLinkedInStatus, userWebsiteStatus, userInstagramStatus, fullName, businessName, email, phone, address;

        switch(this.props.user.status) {
            case 'edit user_title loading': userTitleStatus = 'loading'; break;
            case 'edit user_title success': userTitleStatus = 'success'; break;
            case 'edit user_title error': userTitleStatus = 'error'; break;
            case 'edit user_education loading': userEducationStatus = 'loading'; break;
            case 'edit user_education success': userEducationStatus = 'success'; break;
            case 'edit user_education error': userEducationStatus = 'error'; break;
            case 'edit user_github loading': userGithubStatus = 'loading'; break;
            case 'edit user_github success': userGithubStatus = 'success'; break;
            case 'edit user_github error': userGithubStatus = 'error'; break;
            case 'edit user_twitter loading': userTwitterStatus = 'loading'; break;
            case 'edit user_twitter success': userTwitterStatus = 'success'; break;
            case 'edit user_twitter error': userTwitterStatus = 'error'; break;
            case 'edit user_facebook loading': userFacebookStatus = 'loading'; break;
            case 'edit user_facebook success': userFacebookStatus = 'success'; break;
            case 'edit user_facebook error': userFacebookStatus = 'error'; break;
            case 'edit user_linkedin loading': userLinkedInStatus = 'loading'; break;
            case 'edit user_linkedin success': userLinkedInStatus = 'success'; break;
            case 'edit user_linkedin error': userLinkedInStatus = 'error'; break;
            case 'edit user_website loading': userWebsiteStatus = 'loading'; break;
            case 'edit user_website success': userWebsiteStatus = 'success'; break;
            case 'edit user_website error': userWebsiteStatus = 'error'; break;
            case 'edit user_instagram loading': userInstagramStatus = 'loading'; break;
            case 'edit user_instagram success': userInstagramStatus = 'success'; break;
            case 'edit user_instagram error': userInstagramStatus = 'error'; break;
        }
        
        if (this.props.user.user.display_fullname) {
            fullName = <div className='user-info mb-2'>
                <div>
                    <h5>Name</h5>
                </div>

                <div className='ml-3 mt-3'>
                    {this.props.user.user.user_firstname} {this.props.user.user.user_lastname}
                </div>

                <hr/>
            </div>;
        }

        if (this.props.user.user.user_business_name) {
            businessName = <h3><FontAwesomeIcon icon={faBuilding} className='view-user-icon' /> {this.props.user.user.user_business_name}</h3>;
        }

        if (!this.props.user.user.hide_email) {
            email = <div className='user-info mb-2'>
                <div>
                    <h5>Email</h5>
                </div>

                <div className='ml-3 mt-3'>
                    {this.props.user.user.user_email}
                </div>

                <hr/>
            </div>;
        }

        if (this.props.user.user.user_phone) {
            phone = <div className='user-info mb-2'>
                <div>
                    <h5>Phone Number:</h5>
                </div>

                <div className='ml-3 mt-3'>
                    {this.props.user.user.user_phone}
                </div>

                <hr/>
            </div>;
        }

        if (this.props.user.user.user_address) {
            address = <div className='user-info mb-2'>
                <div>
                    <h5>Address:</h5>
                </div>

                <div className='user-address ml-3 mt-3'>
                    {this.props.user.user.user_address}
                </div>

                <hr/>
            </div>;
        }

        return(
            <section id='edit-user' className='blue-panel shallow three-rounded'>
                <div className='row'>
                    <div className='col-2'>
                        <UserProfilePic url={this.props.user.user.avatar_url} editable={true} />

                        <hr/>

                        <div id='user-profile'>
                            {fullName}
                            {email}
                            {phone}
                            {address}
                            <UserTitle user={this.props.user.user} />
                            <hr/>
                            <UserInfo label='Education' value={this.props.user.user.user_education} type='user_education' status={userEducationStatus} />
                            <hr/>
                            <UserInfo label='Github' value={this.props.user.user.user_github} type='user_github' status={userGithubStatus} />
                            <hr/>
                            <UserInfo label='Twitter' value={this.props.user.user.user_twitter} type='user_twitter' status={userTwitterStatus} />
                            <hr/>
                            <UserInfo label='Facebook' value={this.props.user.user.user_facebook} type='user_facebook' status={userFacebookStatus} />
                            <hr/>
                            <UserInfo label='Instagram' value={this.props.user.user.user_instagram} type='user_instagram' status={userInstagramStatus} />
                            <hr/>
                            <UserInfo label='LinkedIn' value={this.props.user.user.user_linkedin} type='user_linkedin' status={userLinkedInStatus} />
                            <hr/>
                            <UserInfo label='Website' value={this.props.user.user.user_website} type='user_website' status={userWebsiteStatus} />
                        </div>
                    </div>
                    
                    <div className='col-10'>
                        <NavLink to={`/user/${this.props.user.user.username}`}><h1>{this.props.user.user.username}</h1></NavLink>
                        {businessName}

                        <hr/>

                        <UserDetails user={this.props.user} />

                        {/* <hr/>

                        <UserServices user={this.props.user} /> */}
                    </div>
                </div>
            </section>
        )
    }
}

EditUser.propTypes = {
    user: PropTypes.object.isRequired,
    status: PropTypes.string
}

export default connect()(EditUser);