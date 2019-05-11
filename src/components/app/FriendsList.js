import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from '../utils/Loading';
import fetch from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserFriends, faUserMinus, faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
import { connect } from 'react-redux';
import { Alert } from '../../actions/AlertActions';
import { LogError } from '../utils/LogError';
import TitledContainer from '../utils/TitledContainer';
import UserProfilePic from '../includes/page/UserProfilePic';
import { faBuilding, faIdCard } from '@fortawesome/pro-regular-svg-icons';
import { NavLink, Redirect } from 'react-router-dom';
import AlphaNumericFilter from '../utils/AlphaNumericFilter';

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
        if (prevState.offset !== this.state.offset || prevState.filtering !== this.state.filtering) {
            this.setState({status: 'Fetching'});
            
            fetch.post('/api/get/user/friends', {letter: this.state.filtering, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', friends: resp.data.friends});
                } else if (resp.data.status === 'error') {
                    this.setState({status: 'error'});
                }
            })
            .catch(err => LogError(err, '/api/get/user/friends'));
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/user/friends', {letter: 'All', offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', friends: resp.data.friends, totalFriends: resp.data.totalFriends});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/user/get/friends');
            this.setState({status: ''});
        });
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

    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        } else if (this.state.status === 'Loading') {
            return <Loading size='7x' color='black' />;
        }

        if (this.props.user.user) {
            return(
                <section id='friends-list' className='main-panel'>
                    <TitledContainer title='Friends List' icon={<FontAwesomeIcon icon={faUserFriends} />} bgColor='lightblue'>
                        <div className='filter-container'>
                            <AlphaNumericFilter filter={(letter) => this.setState({filtering: letter})} currentLetter={this.state.filtering} />
                        </div>

                        <div className='friend-list-container'>
                            {this.state.status === 'Fetching' 
                                ? <div className='text-center'><FontAwesomeIcon icon={faCircleNotch} size='5x' spin /></div> 
                                : this.state.friends.map((friend, i) => {
                                return <div className='friend-panel' key={i}>
                                    <div className='friend-panel-buttons'>
                                        {this.state.status === 'Removing' ? <FontAwesomeIcon icon={faCircleNotch} className='text-black' spin /> : <FontAwesomeIcon icon={faUserMinus} className='text-highlight' onClick={() => this.removeFriend(friend.friend_user_2, i)} />}
                                    </div>

                                    <div className='friend-panel-header'>
                                        <div className='friend-panel-profile-pic'><UserProfilePic url={friend.avatar_url} square /></div>

                                        <div className='friend-panel-header-info'>
                                            <div className='friend-panel-header-container'>
                                                <h5>{friend.listing_status && friend.listing_status === 'Active' ? <NavLink to={`/user/${friend.friend_user_2}`}>{friend.friend_user_2}</NavLink> : friend.friend_user_2}</h5>
                                                {friend.user_email ? <a href={`mailto:${friend.user_email}`} rel='noopener noreferrer' target='_blank'>{friend.user_email}</a> : ''}
                                                {friend.user_business_name ? <div className='friend-panel-header-child'><FontAwesomeIcon icon={faBuilding} className='text-special' /> <strong>{friend.user_business_name}</strong></div> : ''}
                                                {friend.user_title ? <div className='friend-panel-header-child'><FontAwesomeIcon icon={faIdCard} className='text-special' /> <strong>{friend.user_title}</strong></div> : ''}
                                            </div>
                                        </div>
                                    </div>

                                    {friend.link_work_acct_status === 'Approved' || friend.listing_status === 'Active' ? 
                                    <div className='friend-panel-footer'>
                                        <div className='text-right'>
                                        {friend.listing_status === 'Active' ? <span className='mini-badge mini-badge-success ml-1'>Listed</span> : ''}
                                        {friend.link_work_acct_status === 'Approved' ? <span className='mini-badge mini-badge-success ml-1'>Linked</span> : ''}
                                        </div>
                                    </div>
                                    : ''}
                                </div>
                            })}
                        </div>

                        {parseInt(this.state.totalFriends) > 30 ? <div className='text-center'><button className='btn btn-primary btn-sm' onClick={() => this.setState({offset: this.state.offset + 30})}>Load more</button></div> : ''}
                    </TitledContainer>
                </section>
            )
        }

        return <Loading size='7x' color='black' />;
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