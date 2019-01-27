import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from '../utils/Loading';
import fetch from 'axios';
import ListingRow from '../includes/page/ListingRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUserFriends, faGlobe, faUserMinus, faEnvelope, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
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
import MessageSender from '../includes/page/MessageSender';
import InputWrapper from '../utils/InputWrapper';

class FriendsList extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            friends: [],
            filtering: 'All',
            totalFriends: 0,
            offset: 0
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.offset !== this.state.offset) {
            this.setState({status: 'Loading'});
            
            fetch.post('/api/user/get/friends', {letter: this.state.filtering, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let friendsList = [...this.state.friends, ...resp.data.friends];

                    this.setState({status: '', friends: friendsList});
                } else if (resp.data.status === 'error') {
                    this.setState({status: 'error'});
                }
            })
            .catch(err => LogError(err, '/api/user/get/friends'));
        }
    }
    
    componentDidMount() {
        fetch.post('/api/user/get/friends', {letter: 'All', offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', friends: resp.data.friends, totalFriends: resp.data.totalFriends});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => LogError(err, '/api/user/get/friends'));
    }

    removeFriend(user, index) {
        this.setState({status: 'Removing'});

        fetch.post('/api/user/friend', {user: user, action: 'remove'})
        .then(resp => {
            if (resp.data.status === 'success') {
                let friendsList = [...this.state.friends];
                friendsList.splice(index, 1);

                this.setState({status: '', friends: friendsList});
            } else if (this.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/user/friend'));
    }

    filter(letter) {
        if (this.state.filtering !== letter) {
            this.setState({status: 'Loading'});

            fetch.post('/api/user/get/friends', {letter: letter})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', filtering: letter, friends: resp.data.friends});
                } else {
                    this.setState({status: ''});
                }
            })
            .catch(err => LogError(err, '/api/user/get/friends'));
        }
    }
    
    render() {
        console.log(this.state);
        let status;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        let filter = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '-', '_'];

        return(
            <section id='friends-list' className='main-panel'>
                {status}
                <TitledContainer title='Friends List' icon={<FontAwesomeIcon icon={faUserFriends} />} bgColor='lightblue'>
                    <div id='friends-list-filter'>
                        {filter.map((letter, i) => {
                            return <div key={i} className={`friends-list-filter-button ${this.state.filtering === letter ? 'active' : ''}`} onClick={() => this.filter(letter)}>{letter}</div>
                        })}
                        <div className={`friends-list-filter-button ${this.state.filtering === 'All' ? 'active' : ''}`} onClick={() => this.filter('All')}>All</div>
                    </div>

                    <div className='friend-list-container'>
                        {this.state.friends.map((friend, i) => {
                            return <div className='friend-panel' key={i}>
                                <div className='friend-panel-buttons'>
                                    {this.state.status === 'Removing' ? <FontAwesomeIcon icon={faCircleNotch} className='text-black' spin /> : <FontAwesomeIcon icon={faUserMinus} className='text-highlight' onClick={() => this.removeFriend(friend.friend_user_2, i)} />}
                                </div>

                                <div className='friend-panel-header'>
                                    <div className='friend-panel-profile-pic'><UserProfilePic url={friend.avatar_url} square /></div>

                                    <div className='friend-panel-header-info'>
                                        <div className='friend-panel-header-container'>
                                            <h5><NavLink to={`/user/${friend.friend_user_2}`}>{friend.friend_user_2}</NavLink></h5>
                                            {friend.user_email ? <a href={`mailto:${friend.user_email}`}>{friend.user_email}</a> : ''}
                                            {friend.user_business_name ? <div><FontAwesomeIcon icon={faBuilding} className='text-special' /> <strong>{friend.user_business_name}</strong></div> : ''}
                                            {friend.user_title ? <div><FontAwesomeIcon icon={faIdCard} className='text-special' /> <strong>{friend.user_title}</strong></div> : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>

                    {parseInt(this.state.totalFriends) > 30 ? <div className='text-center'><button className='btn btn-primary btn-sm' onClick={() => this.setState({offset: this.state.offset + 30})}>Load more</button></div> : ''}
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