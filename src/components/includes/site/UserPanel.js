import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LogoutUser } from '../../../actions/LoginActions';
import { faSignOutAlt, faSignInAlt, faUserPlus, faEnvelope, faBell, faCog, faUser } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import NotificationPanel from './NotificationPanel';

class UserPanel extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showNotification: false
        }
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.user.status === 'getting session') {
            return false;
        }

        return true;
    }
    
    render() {
        let panel, notificationPanel;
        console.log(this.props.user.user);

        if (this.props.user.status === 'get session success') {
            panel = <React.Fragment>
                <div className='mr-2 w-20'>
                    <div className='profile-pic' style={{background: `url('${this.props.user.user.avatar_url}') center top / cover`}}></div>
                </div>
                
                <div>
                    <div className='d-flex-center mb-1'>
                        <div className={`listing-indicator mr-2 ${this.props.user.user.listing_status === 'Active' ? 'listed' : 'not-listed'}`} title={this.props.user.user.listing_status === 'Active' ? 'Listed' : 'Not Listed'}></div>
                        <NavLink to={`/user/${this.props.user.user ? this.props.user.user.username : ''}`}>{this.props.user.user ? this.props.user.user.username : ''}</NavLink>
                    </div>

                    <div className='d-flex-between-center'>
                        <div className='nav-item mr-3' title='Dashboard'><NavLink to='/dashboard/edit'><FontAwesomeIcon icon={faUser} size='lg' /></NavLink></div>
                        <div className='nav-item mr-3' title='Settings'><NavLink to='/settings/account'><FontAwesomeIcon icon={faCog} size='lg' /></NavLink></div>
                        <div className='nav-item mr-3' title='Messages'>
                            <NavLink to='/messages/Inquiries'>
                                <span className='fa-layers fa-fw'>
                                    <FontAwesomeIcon icon={faEnvelope} size='lg' />
                                    {parseInt(this.props.user.messages) > 0 ? <small className='icon-counter fa-layers-text'><strong className='badge badge-danger'>{this.props.user.messages}</strong></small> : ''}
                                </span>
                            </NavLink>
                        </div>
                        <div className='nav-item mr-3' title='Notifications'>
                            <span id='notification-icon' className='fa-layers fa-fw' onClick={() => this.setState({showNotification: !this.state.showNotification})}>
                                <FontAwesomeIcon icon={faBell} size='lg' />
                                {parseInt(this.props.user.notifications) > 0 ? <small className='icon-counter fa-layers-text'><strong className='badge badge-danger'>{this.props.user.notifications}</strong></small> : ''}
                            </span>
                        </div>
                        <div className='nav-item mr-3' title='Logout' onClick={() => this.props.dispatch(LogoutUser())}><FontAwesomeIcon icon={faSignOutAlt} size='lg' /></div>
                    </div>
                </div>
            </React.Fragment>;
        } else if (this.props.user.status === 'get session fail' || this.props.user.status === 'access error' || this.props.user.status === 'error' || this.props.user.status === 'not logged in') {
            panel = <div className='d-flex-between-center w-50'>
                <div className='nav-item' title='Login'><NavLink to='/'><FontAwesomeIcon icon={faSignInAlt} size='2x' /></NavLink></div>
                <div className='nav-item' title='Register'><a href='/register'><FontAwesomeIcon icon={faUserPlus} size='2x' /></a></div>
            </div>
        } else {
            panel = <div></div>;
        }

        if (this.state.showNotification) {
            notificationPanel = <NotificationPanel close={() => this.setState({showNotification: false})} />;
        }

        return (
            <div className='d-flex-start w-100'>
                {panel}

                {notificationPanel}
            </div>
        );
    }
}

UserPanel.propTypes = {
    user: PropTypes.object
};

export default connect()(UserPanel);