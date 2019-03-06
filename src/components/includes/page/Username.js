import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'axios';
import { LogError } from '../../utils/LogError';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faIdBadge, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faBan, faCircleNotch, faTimes, faThumbsDown, faThumbsUp, faUserPlus, faUserMinus, faUserTimes, faUser, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import UserProfilePic from './UserProfilePic';
import { connect } from 'react-redux';
import { ToggleMenu } from '../../../actions/MenuActions';
import { Alert } from '../../../actions/AlertActions';

class Username extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: '',
            user: false,
            target: false
        }
    }

    componentWillUnmount() {
        localStorage.removeItem(this.props.username);
    }
    
    togglePopup(e) {
        e.stopPropagation();

        let date = new Date();
        let nowInMinutes = date.getTime() / (1000 * 60);
        let localStorageUser = localStorage.getItem(this.props.username);
        let user = JSON.parse(localStorageUser);
        let target = this.props.username + nowInMinutes;

        if (!this.props.menu.show && this.state.target !== this.props.menu.id) {
            this.props.dispatch(ToggleMenu(true, target));
            this.setState({status: 'Loading', target: target});

            if (user && nowInMinutes - user.time < 30) {
                this.setState({status: '', user: user.user});
            } else {
                fetch.post('/api/get/user/minimal', {user: this.props.username})
                .then(resp => {
                    if (resp.data.status === 'success') {
                        localStorage.setItem(this.props.username, JSON.stringify({user: resp.data.user, time: nowInMinutes}));

                        this.setState({status: '', user: resp.data.user});
                    } else if (resp.data.status === 'error') {
                        this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                    }
                })
                .catch(err => LogError(err, '/api/get/user/minimal'));
            }
        } else if (this.props.menu.show && this.state.target === this.props.menu.id) {
            this.props.dispatch(ToggleMenu(false, ''));
            this.setState({user: false});
        } else if (this.props.menu.show && this.state.target !== this.props.menu.id) {
            this.props.dispatch(ToggleMenu(true, target));
            this.setState({status: 'Loading', target: target});

            if (user && nowInMinutes - user.time < 30) {
                this.setState({status: '', user: user.user});
            } else {
                fetch.post('/api/get/user/minimal', {user: this.props.username})
                .then(resp => {
                    if (resp.data.status === 'success') {
                        localStorage.setItem(this.props.username, JSON.stringify({user: resp.data.user, time: nowInMinutes}));

                        this.setState({status: '', user: resp.data.user});
                    } else if (resp.data.status === 'error') {
                        this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                    }
                })
                .catch(err => LogError(err, '/api/get/user/minimal'));
            }
        }
    }

    friendUser(action) {
        if (this.state.status !== 'Adding') {
            this.setState({status: 'Adding'});

            fetch.post('/api/user/friend', {user: this.state.user.username, action: action})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let user = {...this.state.user};
                    let value;

                    if (action === 'add') {
                        value = '1';
                    } else if (action === 'remove') {
                        value = '0';
                    }

                    let userString = localStorage.getItem(this.state.user.username);
                    let userObj = JSON.parse(userString);
                    userObj.user.is_friend = value;

                    localStorage.setItem(this.state.user.username, JSON.stringify({userObj}));
                    user.is_friend = value;

                    this.setState({status: '', user: user});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                }

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            });
        }
    }

    render() {
        let popup, icon;

        if (this.state.status === 'Adding') {
            icon = <FontAwesomeIcon icon={faCircleNotch} spin className='text-dark' />;
        } else if (this.state.user.is_friend === '1') { 
            icon = <FontAwesomeIcon icon={faUserMinus} className='text-alt-highlight mr-1' onClick={() => this.friendUser('remove')} />;
        } else if (this.state.user.is_friend === '0') {
            icon = <FontAwesomeIcon icon={faUserPlus} className='text-alt-highlight mr-1' onClick={() => this.friendUser('add')} />;
        }

        if (this.props.menu.show && this.state.target === this.props.menu.id) {
            if (this.state.status === 'Loading') {
                popup = <div className={`username-popup${this.props.right ? ' right' : ''}${this.props.top ? ' top' : ''}`}>
                    <FontAwesomeIcon icon={faCircleNotch} size='2x' spin />
                </div>;
            } else if (!this.state.status && this.state.user) {
                popup = <div className={`username-popup${this.props.right ? ' right' : ''}${this.props.top ? ' top' : ''}`}>
                    <div className='username-popup-container' onClick={(e) => e.stopPropagation()}>
                        <div className='username-popup-header'>
                            <div className='username-popup-profile-pic'><UserProfilePic url={this.state.user.avatar_url} /></div>
    
                            <div className='username-popup-user-info'>
                                {this.state.user.listing_status && this.state.user.listing_status === 'Active' ? <h5><NavLink to={`/user/${this.state.user.username}`}>{this.state.user.username}</NavLink></h5> : <h5>{this.state.user.username}</h5>}
    
                                {this.state.user.user_business_name ? <div><FontAwesomeIcon icon={faBuilding} className='text-special mr-1' /> {this.state.user.user_business_name}</div> : ''}
    
                                {this.state.user.user_title ? <div><FontAwesomeIcon icon={faIdBadge} className='text-special mr-1' /> {this.state.user.user_title}</div> : ''}
    
                                {this.state.user.user_email ? <a href={`mailto:${this.state.user.user_email}`}>{this.state.user.user_email}</a> : ''}
                            </div>
                        </div>
    
                        <hr/>
    
                        <div className='username-popup-body'>
                            <div className='username-popup-body-child'><FontAwesomeIcon icon={faCheckCircle} className='text-success mr-1' /> {this.state.user.job_complete}</div>
    
                            <div className='username-popup-body-child'><FontAwesomeIcon icon={faBan} className='text-danger mr-1' /> {this.state.user.job_abandoned}</div>

                            <div className='username-popup-body-child'>{icon}</div>
                        </div>
                    </div>
                </div>;
            }
        }

        return (
            <div className={`username-container ${this.props.className ? this.props.className : ''}`}>
                <div className={`username text-${this.props.color ? this.props.color : 'white'}`} onClick={(e) => this.togglePopup(e)} unselectable='on'>{this.props.username}</div>

                {popup}
            </div>
        )
    }
}

Username.propTypes = {
    user: PropTypes.object
};

const mapStateToProps = state => {
    return {
        menu: state.Menu
    }
}

export default connect(mapStateToProps)(Username);