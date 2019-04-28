import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faUserFriends, faUserSlash, faBell, faUser, faCommentAlt, faFilePlus, faBriefcase, faLink, faSyncAlt, faCog, faSignOut, faBars, faTimes } from '@fortawesome/pro-solid-svg-icons';
import { LogError } from '../utils/LogError';
import { connect } from 'react-redux';
import moment from 'moment';
import fetch from 'axios';
import { GetUserNotificationAndMessageCount, UpdateUserNotifications } from '../../actions/FetchActions';
import { LogoutUser } from '../../actions/LoginActions';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import SubmitButton from '../utils/SubmitButton';
import Recaptcha from 'react-recaptcha';
import LoginPanel from '../includes/site/LoginPanel';

let recaptchaInstance;

class Site extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showProfileMenu: false,
            showNotification: false,
            email: '',
            notifications: []
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevState.showNotification !== this.state.showNotification && this.state.showNotification) {
            fetch.post('/api/get/user/notifications', {new: true})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.props.dispatch(GetUserNotificationAndMessageCount());
                    this.setState({status: '', notifications: resp.data.notifications});
                } else if (resp.data.status === 'error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => LogError(err, '/api/user/get/notifications'));
        }
        
        if (prevState.showNotification && !this.state.showNotification && this.state.notifications.length > 0) {
            this.props.dispatch(UpdateUserNotifications());
            this.setState({notifications: []});
        }

        if (prevProps.location.key !== this.props.location.key) {
            this.setState({showNav: false});
        }

        if (prevState.showNav !== this.state.showNav && this.state.showNav) {
            document.body.style.overflowY = 'hidden';
        } else if (prevState.showNav !== this.state.showNav && !this.state.showNav) {
            document.body.style.overflowY = 'auto';
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.resize = () => {
            if (window.innerWidth >= 1024) {
                document.body.style.overflowY = 'auto';
            } else if (window.innerWidth < 1024 && this.state.showNav) {
                document.body.style.overflowY = 'hidden';
            }
        });
    }
    
    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }
    
    subscribe(val) {
        this.setState({status: 'Subscribing'});

        fetch.post('/api/email/subscribe', {email: this.state.email, verified: val})
        .then(resp => {
            this.setState({status: '', email: ''});
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            recaptchaInstance.reset();
        })
        .catch(err => {
            LogError(err, '/api/email/subscribe');
            this.setState({status: ''});
            recaptchaInstance.reset();
        });
    }

    verify(val) {
        this.subscribe(val);
    }
    
    toggleProfileMenu() {
        this.setState({showProfileMenu: !this.state.showProfileMenu});
    }
    
    toggleNotification() {
        this.setState({showNotification: !this.state.showNotification});
    }
    
    logout() {
        this.props.dispatch(LogoutUser());
    }

    render() {
        let userPanel;
        
        if (this.props.user.user) {
            userPanel = <div className={`site-top-user-panel ${this.state.showProfileMenu ? 'show' : ''}`}>
                <div className='mb-3'><FontAwesomeIcon icon={faUserCircle} className='text-alt-highlight mr-1' /> <NavLink to='/dashboard'>{this.props.user.user.username}</NavLink></div>

                <div className='d-flex'>
                    <NavLink to='/dashboard/friends'><FontAwesomeIcon icon={faUserFriends} className='site-top-user-icon mr-3' size='lg' /></NavLink>
                    <NavLink to='/dashboard/blocked-users'><FontAwesomeIcon icon={faUserSlash} className='site-top-user-icon mr-3' size='lg' /></NavLink>
                    <div className='site-top-user-menu p-relative' onClick={this.toggleNotification.bind(this)}>
                        <FontAwesomeIcon icon={faBell} className='site-top-user-icon' size='lg' />
                        {parseInt(this.props.user.notifications) > 0 ? <div className='notification-counter mini-badge mini-badge-special'>{this.props.user.notifications}</div> : ''}
                    </div>
                </div>

                <hr/>

                <div className='site-top-user-menu-container'>
                    <div className={`site-top-user-menu ${this.state.showNotification ? 'hide' : ''}`}>
                        <div className='site-top-user-menu-item'><FontAwesomeIcon icon={faUser} className='mr-2' /> <NavLink to='/dashboard/profile'>My Profile</NavLink></div>
                        <div className='site-top-user-menu-item'><FontAwesomeIcon icon={faCommentAlt} className='mr-2' /> <NavLink to='/dashboard/conversations'>Conversations</NavLink> {parseInt(this.props.user.messages) > 0 ? <span className='mini-indicator ml-1'></span> : ''}</div>
                        <div className='site-top-user-menu-item'><FontAwesomeIcon icon={faFilePlus} className='mr-2' /> <NavLink to='/dashboard/post/job'>Post a Job</NavLink></div>
                        <div className='site-top-user-menu-item'><FontAwesomeIcon icon={faBriefcase} className='mr-2' /> <NavLink to='/dashboard/jobs'>My Jobs</NavLink> {parseInt(this.props.user.job_messages.opened_job_message_count) + parseInt(this.props.user.job_messages.active_job_message_count) + parseInt(this.props.user.proposals) > 0 ? <span className='mini-indicator ml-1'></span> : ''}</div>
                        <div className='site-top-user-menu-item'><FontAwesomeIcon icon={faLink} className='mr-2' /> <NavLink to='/dashboard/link'>Link</NavLink></div>
                        <div className='site-top-user-menu-item'><FontAwesomeIcon icon={faSyncAlt} className='mr-2' /> <NavLink to='/dashboard/subscription'>Subscription</NavLink></div>
                        <div className='site-top-user-menu-item'><FontAwesomeIcon icon={faCog} className='mr-2' /> <NavLink to='/dashboard/settings/account'>Settings</NavLink></div>
                        <div className='site-top-user-menu-item' onClick={this.logout.bind(this)}><FontAwesomeIcon icon={faSignOut} className='mr-2' /> <strong>Logout</strong></div>
                    </div>

                    <div className={`site-top-user-notifications ${this.state.showNotification ? 'show' : ''}`}>
                        {parseInt(this.props.user.notifications) === 0
                            ? <div className='text-center'>No notifications</div>
                            : this.state.notifications.map((n, i) => {
                                let notification_icon;

                                if (n.notification_type === 'Update') {
                                    notification_icon = <span className='mini-badge mini-badge-info'>{n.notification_type}</span>;
                                } else if (n.notification_type === 'Warning') {
                                    notification_icon = <span className='mini-badge mini-badge-warning'>{n.notification_type}</span>;
                                } else if (n.notification_type === 'Severe') {
                                    notification_icon = <span className='mini-badge mini-badge-danger'>{n.notification_type}</span>;
                                }

                                return <div key={n.notification_id} className={`${i !== this.state.notifications.length - 1 ? 'mb-3' : ''}`}>
                                    <div className='mb-1' dangerouslySetInnerHTML={{__html: n.notification_message}}></div>

                                    <div className='d-flex-between-center'>
                                        {notification_icon}
                                        <small>{moment(n.notification_date).format('MMM DD YYYY h:mm:ss A')}</small>
                                    </div>

                                    {i !== this.state.notifications.length - 1 ? <hr /> : ''}
                                </div>
                            })}
                    </div>
                </div>
            </div>;
        } else {
            userPanel = <LoginPanel />;
        }

        return (
            <div id='site' className='site'>
                <div className={`site-overlay ${this.state.showNav ? 'show' : ''}`} onClick={() => this.setState({showNav: false})} style={{'top': window.pageYOffset + 'px'}}></div>
                <div className={`site-mobile-nav-container ${this.state.showNav ? 'show' : ''}`} style={{'top': window.pageYOffset + 'px'}}>
                    <div className='site-mobile-nav-menu-container'>
                        <div className='site-mobile-nav-close-button'><FontAwesomeIcon icon={faTimes} size='2x' onClick={() => this.setState({showNav: false})} /></div>
                        <div className='mb-2'><NavLink to='/'>Main</NavLink></div>
                        <div className='mb-2'><NavLink to='/features'>Feature</NavLink></div>
                        <div className='mb-2'><NavLink to='/pricing'>Pricing</NavLink></div>
                    </div>

                    {userPanel}
                </div>

                <div className='site-top-bar'>
                    <div className='site-top-bar-container'>
                        <NavLink to='/'><img src='/images/logo_md.png' className='site-logo' /></NavLink>
    
                        <div className='site-nav-bar'>
                            <div className='site-nav-item'><NavLink to='/'>Main</NavLink></div>
                            <div className='site-nav-item'><NavLink to='/features'>Feature</NavLink></div>
                            <div className='site-nav-item'><NavLink to='/pricing'>Pricing</NavLink></div>

                            {!this.props.user.user
                                ? <React.Fragment>
                                    <div className='ml-5 site-nav-item'><NavLink to='/main'>Login</NavLink></div>
                                    <div className='site-nav-item'><NavLink to='/register'>Register</NavLink></div>
                                </React.Fragment>
                                : <div className='site-top-user-container ml-5'>
                                    <div className={`site-top-user-icon ${this.state.showProfileMenu ? 'active' : ''}`} onClick={this.toggleProfileMenu.bind(this)}><FontAwesomeIcon icon={faUserCircle} size='lg' /></div>
                                    {userPanel}
                                </div>
                            }
                        </div>

                        <div className='site-mobile-nav-button'><FontAwesomeIcon icon={faBars} size='2x' onClick={() => this.setState({showNav: true})} /></div>
                    </div>
                </div>

                {this.props.children}

                <div className='site-main-footer'>
                    <div className='site-main-footer-container mb-3'>
                        <div className='main-links'>
                            <h5 className='mb-2'>Links</h5>
                            <NavLink to='/' className='footer-link'>Main</NavLink>
                            <NavLink to='/features' className='footer-link'>Features</NavLink>
                            <NavLink to='/pricing' className='footer-link'>Pricing</NavLink>
                            {!this.props.user.user ? <NavLink to='/main' className='footer-link'>Login</NavLink> : ''}
                            {!this.props.user.user ? <NavLink to='/register' className='footer-link'>Register</NavLink> : ''}
                            <NavLink to='/about' className='footer-link'>About</NavLink>
                            <NavLink to='/faq' className='footer-link'>FAQ</NavLink>
                            <NavLink to='/contact' className='footer-link'>Contact</NavLink>
                        </div>

                        <div className='site-main-footer-section right-bordered'>
                            <h5 className='mb-2'>Browse Jobs</h5>

                            <div className='footer-link-container right-bordered'>
                                {this.props.sectors.map((sector) => {
                                    return <NavLink key={sector.sector} to={`/sectors/jobs/${sector.sector}`} className='footer-link mr-3'>{sector.sector}</NavLink>
                                })}
                            </div>
                        </div>

                        <div className='site-main-footer-section'>
                            <h5 className='mb-2'>Browse Profiles</h5>

                            <div className='footer-link-container'>
                                {this.props.sectors.map((sector) => {
                                    return <NavLink key={sector.sector} to={`/sectors/profiles/${sector.sector}`} className='footer-link mr-3'>{sector.sector}</NavLink>
                                })}
                            </div>
                        </div>
                    </div>

                    <div className='site-main-sub-footer'>
                        <div className='mr-5'><strong className='mr-2'>Follow us</strong> <a href='https://www.facebook.com/hireworld' target='_blank' rel='noreferer noopener'><FontAwesomeIcon icon={faFacebook} className='text-blue' /></a></div>

                        <div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                recaptchaInstance.execute();
                            }}><input type='email' placeholder='Enter email' onChange={(e) => this.setState({email: e.target.value})} value={this.state.email} /> <SubmitButton type='submit' loading={this.state.status === 'Subscribing'} value='Subscribe' />

                            <Recaptcha ref={e => recaptchaInstance = e} sitekey='6Lewe6AUAAAAAMMaBYzkeXgxw-WTdFlSqG6wMl1m' size='invisible' verifyCallback={(val) => this.verify(val)} />
                            
                            </form>
                            <small>This site is protected by reCAPTCHA and the Google<br /><a href='https://policies.google.com/privacy' target='_blank' rel='noreferer noopener'>Privacy Policy</a> and <a href='https://policies.google.com/terms' target='_blank' rel='noreferer noopener'>Terms of Service</a> apply.</small>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Site.propTypes = {
    user: PropTypes.object,
    sectors: PropTypes.array
};

export default withRouter(connect()(Site));