import React, { Component } from 'react';
import '../../styles/ViewUser.css';
import UserProfilePic from '../includes/page/UserProfilePic';
import ViewUserContacts from '../includes/page/ViewUserContacts';
import ViewUserProfile from '../includes/page/ViewUserProfile';
import UserReview from '../includes/page/UserReview';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class ViewUser extends Component {
    render() {
        return(
            <div id='view-user' className='main-panel'>
                <div className='blue-panel shallow rounded'>
                    <div className='row'>
                        <div className='col-3'>
                            <UserProfilePic url={this.props.user.avatar_url} editable={false}/>

                            <ViewUserContacts />
                        </div>

                        <div className='col-9'>
                            <ViewUserProfile />
                        </div>
                    </div>
                </div>

                <UserReview />
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(ViewUser));