import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from '../utils/Loading';
import fetch from 'axios';
import ListingRow from '../includes/page/ListingRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUserFriends, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { ShowConfirmation, ResetConfirmation } from '../../actions/ConfirmationActions';
import { connect } from 'react-redux';
import { Alert } from '../../actions/AlertActions';
import { unsaveListing } from '../utils/Utils';
import { LogError } from '../utils/LogError';
import Response from './Response';
import { Redirect, NavLink } from 'react-router-dom';
import TitledContainer from '../utils/TitledContainer';
import UserProfilePic from '../includes/page/UserProfilePic';
import { faBuilding, faIdCard } from '@fortawesome/free-regular-svg-icons';
import { faFacebook, faGithub, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';

class FriendsList extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            friends: []
        }
    }
    
    componentDidMount() {
        fetch.post('/api/user/get/friends')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', friends: resp.data.friends});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => LogError(err, '/api/user/get/friends'));
    }
    
    render() {
        let status;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        return(
            <section id='friends-list' className='main-panel'>
                {status}
                <TitledContainer title='Friends List' icon={<FontAwesomeIcon icon={faUserFriends} />} bgColor='lightblue' className='friend-list-container'>
                    {this.state.friends.map((friend, i) => {
                        return <div className='friend-panel' key={i}>
                            <div className='friend-panel-header'>
                                <div className='friend-panel-profile-pic'><UserProfilePic url={friend.avatar_url} square /></div>

                                <div className='friend-panel-header-info'>
                                    <div className='friend-panel-header-container'>
                                        <h4><NavLink to={`/user/${friend.friend_user_2}`}>{friend.friend_user_2}</NavLink></h4>
                                        {friend.user_business_name ? <div><FontAwesomeIcon icon={faBuilding} className='text-special' /> <strong>{friend.user_business_name}</strong></div> : ''}
                                        {friend.user_title ? <div><FontAwesomeIcon icon={faIdCard} className='text-special' /> <strong>{friend.user_title}</strong></div> : ''}
                                    </div>

                                    <div className='friend-panel-body'>
                                        {friend.user_facebook ? <FontAwesomeIcon icon={faFacebook} className='text-highlight' size='lg' /> : ''}
                                        {friend.user_github ? <FontAwesomeIcon icon={faGithub} className='text-highlight' size='lg' /> : ''}
                                        {friend.user_twitter ? <FontAwesomeIcon icon={faTwitter} className='text-highlight' size='lg'/> : ''}
                                        {friend.user_instagram ? <FontAwesomeIcon icon={faInstagram} className='text-highlight' size='lg' /> : ''}
                                        {friend.user_linkedin ? <FontAwesomeIcon icon={faLinkedin} className='text-highlight' size='lg' /> : ''}
                                        {friend.user_website ? <FontAwesomeIcon icon={faGlobe} className='text-highlight' size='lg' /> : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    })}
                </TitledContainer>
            </section>
        )
    }
}

FriendsList.propTypes = {
    user: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return {

    }
}

export default connect(mapStateToProps)(FriendsList);