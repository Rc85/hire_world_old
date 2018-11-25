import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LogoutUser } from '../../../actions/LoginActions';
import { faUserCog, faSignOutAlt, faSignInAlt, faUserPlus, faEnvelope, faBell, faCog, faUser } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import Loading from '../../utils/Loading';
import fetch from 'axios';
import { UpdateUserNotifications } from '../../../actions/FetchActions';
import Alert from '../../utils/Alert';
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
        } else {
            return true;
        }
    }
    
    render() {
        let panel, notificationPanel;

        if (this.props.user.status === 'get session success') {
            panel = <React.Fragment>
                <div className='mr-2 w-25'>
                    <div className='profile-pic' style={{background: `url('${this.props.user.user.avatar_url}') center top / cover`}}></div>
                </div>
                
                <div>
                    <div className='mb-1'><NavLink to={`/user/${this.props.user.user ? this.props.user.user.username : ''}`}>{this.props.user.user ? this.props.user.user.username : ''}</NavLink></div>
                    <div className='d-flex-between-center'>
                        <div className='nav-item mr-3' title='Dashboard'><NavLink to='/dashboard/edit'><FontAwesomeIcon icon={faCog} size='lg' /></NavLink></div>
                        <div className='nav-item mr-3' title='Messages'>
                            <NavLink to='/messages/Inquire'>
                                <span className='fa-layers fa-fw'>
                                    <FontAwesomeIcon icon={faEnvelope} size='lg' />
                                    {parseInt(this.props.user.messageCount) > 0 ? <small className='icon-counter fa-layers-text'><strong className='badge badge-danger'>{this.props.user.messageCount}</strong></small> : ''}
                                </span>
                            </NavLink>
                        </div>
                        <div className='nav-item mr-3' title='Notifications'>
                            <span id='notification-icon' className='fa-layers fa-fw' onClick={() => this.setState({showNotification: !this.state.showNotification})}>
                                <FontAwesomeIcon icon={faBell} size='lg' />
                                {this.props.user.notifications.length > 0 ? <small className='icon-counter fa-layers-text'><strong className='badge badge-danger'>{this.props.user.notifications.length}</strong></small> : ''}
                            </span>
                        </div>
                        <div className='nav-item mr-3' title='Logout' onClick={() => this.props.dispatch(LogoutUser())}><FontAwesomeIcon icon={faSignOutAlt} size='lg' /></div>
                    </div>
                </div>
            </React.Fragment>;
        } else {
            panel = <div className='d-flex-between-center w-50'>
                <div className='nav-item' title='Login'><NavLink to='/account/login'><FontAwesomeIcon icon={faSignInAlt} size='2x' /></NavLink></div>
                <div className='nav-item' title='Register'><NavLink to='/account/register'><FontAwesomeIcon icon={faUserPlus} size='2x' /></NavLink></div>
            </div>
        }

        if (this.state.showNotification) {
            notificationPanel = <NotificationPanel items={this.props.user.notifications} close={() => this.setState({showNotification: false})} />;
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