import React, { Component } from 'react';
import '../styles/EditUser.css';
import UserInfo from './UserInfo';
import UserDetails from './UserDetails';
import UserProfiles from './UserProfiles';
import UserProfilePic from './UserProfilePic';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class EditUser extends Component {
    render() {
        let userTitleStatus, userEducationStatus, userGithubStatus, userTwitterStatus, userFacebookStatus, userLinkedInStatus, userWebsiteStatus;

        switch(this.props.status) {
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
        }

        return(
            <section id='edit-user' className='blue-panel shallow w-80'>
                <div className='row'>
                    <div className='col-3'>
                        <UserProfilePic url={this.props.user.avatar_url} editable={true} />

                        <hr/>

                        <div id='user-profile'>
                            <UserInfo label='Title' value={this.props.user.user_title} type='user_title' status={userTitleStatus} />
                            <hr/>
                            <UserInfo label='Education' value={this.props.user.user_education} type='user_education' status={userEducationStatus} />
                            <hr/>
                            <UserInfo label='Github' value={this.props.user.user_github} type='user_github' status={userGithubStatus} />
                            <hr/>
                            <UserInfo label='Twitter' value={this.props.user.user_twitter} type='user_twitter' status={userTwitterStatus} />
                            <hr/>
                            <UserInfo label='Facebook' value={this.props.user.user_facebook} type='user_facebook' status={userFacebookStatus} />
                            <hr/>
                            <UserInfo label='LinkedIn' value={this.props.user.user_linkedin} type='user_linkedin' status={userLinkedInStatus} />
                            <hr/>
                            <UserInfo label='Website' value={this.props.user.user_website} type='user_website' status={userWebsiteStatus} />
                        </div>
                    </div>
                    
                    <div className='col-9'>
                        <h1>{this.props.user.username}</h1>

                        <hr/>

                        <UserDetails userBio={this.props.user.user_bio} />

                        <hr/>

                        <UserProfiles userServices={this.props.user.user_services} />
                    </div>
                </div>
            </section>
        )
    }
}

const mapPropsTostate = state => {
    return {
        user: state.Login.user,
        status: state.Login.status
    }
}

export default withRouter(connect(mapPropsTostate)(EditUser));