import React, { Component } from 'react';
import UserInfo from '../includes/page/UserInfo';
import { NavLink, Redirect } from 'react-router-dom';
import UserProfilePic from '../includes/page/UserProfilePic';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import UserTitle from '../includes/page/UserTitle';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import Loading from '../utils/Loading';
import moment from 'moment';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCalendarAlt, faIdCard } from '@fortawesome/free-regular-svg-icons';
import SlideToggle from '../utils/SlideToggle';
import Badge from '../utils/Badge';
import { faCog, faBell, faListUl, faSlidersH, faCogs, faIdCardAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { LogoutUser, UpdateUser } from '../../actions/LoginActions';
import InputWrapper from '../utils/InputWrapper';
import { Alert } from '../../actions/AlertActions';
import { faGithub, faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { isTyping } from '../../actions/ConfigActions';

class EditUser extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            notificationStatus: 'Loading',
            activityStatus: 'Loading',
            notifications: [],
            activities: [],
            notificationOffset: 0,
            activityOffset: 0,
            notificationsFetched: true,
            activitiesFetched: true
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        let request;

        if ((prevState.notificationOffset !== this.state.notificationOffset) || (prevState.activityOffset !== this.state.activityOffset)) {
            if (prevState.notificationOffset !== this.state.notificationOffset) {
                this.setState({notificationStatus: 'Loading'});

                request = {type: 'notifications', offset: this.state.notificationOffset};
            } else if (prevState.activityOffset !== this.state.activityOffset) {
                this.setState({activityStatus: 'Loading'});

                request = {type: 'activities', offset: this.state.activityOffset};
            }

            fetch.post('/api/get/user/activities', {request: request})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let state = {...this.state};

                    if (request.type === 'notifications') {
                        let notifications = [...prevState.notifications, ...resp.data.notifications];

                        state.notifications = notifications;
                        state.notificationStatus = '';
                        state.notificationsFetched = notifications.length === parseInt(resp.data.notificationCount);
                    } else if (request.type === 'activities') {
                        let activities = [...prevState.activities, ...resp.data.activities];

                        state.activities = activities;
                        state.activityStatus = '';
                        state.activitiesFetched = activities.length === parseInt(resp.data.activityCount);
                    }

                    this.setState(state);
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                }
            })
            .catch(err => {
                LogError(err, `/api/get/user/activities?request=${request}`);
                this.setState({status: ''});
            });
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/user/activities', {request: {type: 'all', offset: 0}})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({
                    notificationStatus: '',
                    activityStatus: '',
                    notifications: resp.data.notifications,
                    activities: resp.data.activities,
                    notificationsFetched: resp.data.notifications.length === parseInt(resp.data.notificationCount),
                    activitiesFetched: resp.data.activities.length === parseInt(resp.data.activityCount)
                });
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/user/activities');
            this.setState({status: ''});
        });
    }

    toggleListing() {
        this.setState({status: 'Loading'});

        let status;

        if (this.props.user.user.listing_status === 'Active') {
            status = 'Inactive';
        } else if (this.props.user.user.listing_status === 'Inactive') {
            status = 'Active';
        }

        fetch.post('/api/listing/toggle', {status: status})
        .then(resp => {
            if (resp.data.status === 'success') {
                let user = {...this.props.user.user};
                user.listing_status = resp.data.listing_status;

                this.props.dispatch(UpdateUser(user));
                this.setState({status: '', listing_status: resp.data.listing_status});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/listing/toggle'));
    }

    saveField(field, val) {
        this.setState({status: 'Saving'});

        fetch.post('/api/user/profile/update', {field: field, value: val})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(UpdateUser(resp.data.user));
            }
            
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            this.setState({status: ''});
        })
        .catch(err => LogError(err, '/api/user/profile/update'));
    }
    
    render() {
        if (this.props.user.status === 'getting session') {
            return <Loading size='7x' />
        } else if (this.props.user.status === 'error') {
            return <Redirect to='/' />;
        } else if (this.props.user.status === 'get session success' && this.props.user.user) {
            let notificationStatus, activityStatus;

            if (this.state.notificationStatus === 'Loading') {
                notificationStatus = <Loading size='3x' />;
            }

            if (this.state.activityStatus === 'Loading') {
                activityStatus = <Loading size='3x' />;
            }

            let notifications = this.state.notifications.map((n, i) => {
                let type;

                if (n.notification_type === 'Update') {
                    type = 'badge-info';
                } else if (n.notification_type === 'Warning') {
                    type = 'badge-warning';
                } else if (n.notification_type === 'Severe') {
                    type = 'badge-danger';
                }

                return <div key={i}>
                    <div className='titled-container-row'>
                        <div className='titled-container-row-title'>
                            <div className='d-flex-start'>
                                {n.notification_status === 'New' ? <small className='mini-badge mini-badge-success mr-1'>New</small> : ''}
                                <small className={`mini-badge mini-${type} mr-1`}>{n.notification_type}</small>
                            </div>
                            <div dangerouslySetInnerHTML={{__html: n.notification_message}}></div>
                        </div>
                    </div>

                    <div className='text-right'><small>{moment(n.notification_date).format('MM-DD-YYYY h:mm:ss A')}</small></div>

                    {i + 1 !== this.state.notifications.length ? <hr /> : ''}
                </div>
            });

            let activities = this.state.activities.map((a, i) => {
                let type;

                if (a.activity_type === 'Account') {
                    type = 'badge-orange';
                } else if (a.activity_type === 'Payment') {
                    type = 'badge-lime';
                } else if (a.activity_type === 'Subscription') {
                    type = 'badge-pink';
                }

                return <div key={i} className='titled-container-row'>
                    <div className='titled-container-row-title mb-1'>
                        {a.activity_action}
                    </div>

                    <div className='titled-container-row-detail'>
                        <div className='activity-badge'>
                            <span className={`mini-badge mini-${type}`}>{a.activity_type}</span>
                        </div>

                        <div className='activity-timestamp'>{moment(a.activity_date).format('MM-DD-YYYY h:mm:ss A')}</div>
                    </div>

                    {i + 1 !== this.state.activities.length ? <hr /> : ''}
                </div>
            });

            return(
                <section id='edit-user' className='main-panel'>
                    <div id='dashboard-header'>
                        <div id='dashboard-header-wrapper'>
                            <div className='profile-pic-wrapper'><UserProfilePic url={this.props.user.user.avatar_url} editable bordered borderColor='transparent' /></div>

                            <div id='dashboard-header-user-info'>
                                <NavLink to={`/user/${this.props.user.user.username}`}><h1>{this.props.user.user.username}</h1></NavLink>

                                <EditUserField field={this.props.user.user.user_business_name} save={(val) => this.saveField('business name', val)} placeholder='3 - 40 characters' maxLength='40' emptyString='Your business name here' label='Business Name' icon={<FontAwesomeIcon icon={faBuilding} className='text-special edit-user-field-icon' />} />

                                <EditUserField field={this.props.user.user.user_title} save={(val) => this.saveField('user title', val)} placeholder='3 - 30 characters' maxLength='30' emptyString='Your profession title here' label='Profession Title' icon={<FontAwesomeIcon icon={faIdCard} className='text-special edit-user-field-icon' />} />

                                <EditUserSocialMedia user={this.props.user.user} save={(field, val) => this.saveField(field, val)} />
                            </div>
                        </div>

                        <div id='dashboard-list-buttons-container'>
                            <NavLink to='/settings/listing'><FontAwesomeIcon icon={faCogs} size='2x' className='dashboard-list-button' color='white' /></NavLink>
                            <SlideToggle status={this.props.user.user.subscription_end_date > new Date() && this.props.user.user.listing_status === 'Active'} onClick={() => this.toggleListing()} />
                            {/* <button id='mobile-logout-button' className='btn btn-secondary' onClick={() => this.props.dispatch(LogoutUser())}>Logout</button> */}
                        </div>
                    </div>

                    <hr/>

                    <div id='dashboard-panel-container'>
                        <div id='notifications-panel' className='dashboard-panel-half mb-5'>
                            <TitledContainer title='Notifications' bgColor='purple' shadow scroll={this.state.notifications.length > 0 ? true : false} icon={<FontAwesomeIcon icon={faBell} />}>
                                {notificationStatus}
                                {this.state.notifications.length > 0 ? notifications : <h5 className='text-muted text-center'>No notifications</h5>}
                                {!this.state.notificationsFetched ? <div className='load-more-button'><button className='btn btn-primary btn-sm' onClick={() => this.setState({notificationOffset: this.state.notificationOffset + 5})}>Load more</button></div> : ''}
                            </TitledContainer>
                        </div>

                        <div id='activities-panel' className='dashboard-panel-half mb-5'>
                            <TitledContainer title='Recent Activities' bgColor='orange' shadow scroll={this.state.activities.length > 0 ? true : false} icon={<FontAwesomeIcon icon={faListUl} />}>
                                {activityStatus}
                                {this.state.activities.length > 0 ? activities : <h5 className='text-muted text-center'>No activities</h5>}
                                {!this.state.activitiesFetched ? <div className='load-more-button'><button className='btn btn-primary btn-sm' onClick={() => this.setState({activityOffset: this.state.activityOffset + 5})}>Load more</button></div> : ''}
                            </TitledContainer>
                        </div>

                        <div id='upcoming-events-panel' className='dashboard-panel-full mb-5'>
                            <TitledContainer title='Upcoming Events' bgColor='lime' shadow icon={<FontAwesomeIcon icon={faCalendarAlt} />}>
                                <h5 className='text-muted text-center'>No upcoming events</h5>
                            </TitledContainer>
                        </div>
                    </div>
                </section>
            )
        }

        return <Redirect to='/' />;
    }
}

class EditUserField extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            value: '',
            edit: false
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.edit !== this.state.edit) {
            this.setState({value: this.props.field});
        }
    }
    
    componentDidMount() {
        this.setState({value: this.props.field});
    }

    save(e) {
        e.preventDefault();

        this.setState({edit: ''});
        this.props.save(this.state.value);
    }
    
    render() {
        let value;
        let input = <InputWrapper label={this.props.label}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => this.save(e)} className='edit-user-field-form'>
                <input type='text' onChange={(e) => this.setState({value: e.target.value})} placeholder={this.props.placeholder} maxLength={this.props.maxLength} value={this.state.value} placeholder='Enter URL' onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                <div className='d-flex-end-center'>
                    <button type='submit' className='btn btn-primary btn-sm mr-1'>Save</button>
                    <button type='button' className='btn btn-secondary btn-sm mr-1' onClick={() => this.setState({edit: false})}>Cancel</button>
                    <button type='button' className='btn btn-light btn-sm' onClick={() => this.setState({value: ''})}>Clear</button>
                </div>
            </form>
        </InputWrapper>;


        if (this.state.edit) {
            value = input;
        } else {
            if (this.props.field) {
                value = <h3>{this.props.icon} <span className='edit-user-field-text'>{this.props.field}</span> <button type='button' className='btn btn-info btn-sm'onClick={() => this.setState({edit: true})}>Edit</button></h3>;
            } else {
                value = <h3 className='text-muted'><span className='edit-user-field-text'>{this.props.emptyString}</span> <button type='button' className='btn btn-info btn-sm' onClick={() => this.setState({edit: true})}>Edit</button></h3>;
            }
        }

        return(
            <div className={`edit-user-header-field ${this.state.edit ? 'edit' : ''}`}>{value}</div>
        )
    }
}

class EditUserSocialMedia extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            edit: false,
            label: '',
            field: '',
            value: ''
        }
    }

    save(e) {
        e.preventDefault();

        this.setState({edit: false});
        this.props.save(this.state.field, this.state.value);
    }
    
    render() {
        let input;

        if (this.state.edit) {
            input = <div className='edit-user-field-container'>
                <InputWrapper label={this.state.label}>
                    <form onSubmit={(e) => this.save(e)} className='edit-user-field-form'>
                        <input type='text' value={this.state.value} onChange={(e) => this.setState({value: e.target.value})} value={this.state.value} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                        <div className='d-flex-end-center'>
                            <button type='submit' className='btn btn-primary btn-sm mr-1'>Save</button>
                            <button type='button' className='btn btn-secondary btn-sm mr-1' onClick={() => this.setState({edit: false})}>Cancel</button>
                            <button type='button' className='btn btn-light btn-sm' onClick={() => this.setState({value: ''})}>Clear</button>
                        </div>
                    </form>
                </InputWrapper>
            </div>
        }
        
        return(
            <div id='edit-user-social-media' className='mt-3'>
                <div id='edit-user-social-media-buttons'>
                    <FontAwesomeIcon icon={faFacebook} id='edit-user-facebook' className='edit-user-social-media-button' size='2x' onClick={() => this.setState({edit: true, label: 'Facebook', field: 'user facebook', value: this.props.user.user_facebook})} />
                    <FontAwesomeIcon icon={faGithub} id='edit-user-github' className='edit-user-social-media-button' size='2x' onClick={() => this.setState({edit: true, label: 'GitHub', field: 'user github', value: this.props.user.user_github})} />
                    <FontAwesomeIcon icon={faTwitter} id='edit-user-twitter' className='edit-user-social-media-button' size='2x' onClick={() => this.setState({edit: true, label: 'Twitter', field: 'user twitter', value: this.props.user.user_twitter})} />
                    <FontAwesomeIcon icon={faInstagram} id='edit-user-instagram' className='edit-user-social-media-button' size='2x' onClick={() => this.setState({edit: true, label: 'Instagram', field: 'user instagram', value: this.props.user.user_instagram})} />
                    <FontAwesomeIcon icon={faLinkedin} id='edit-user-linkedin' className='edit-user-social-media-button' size='2x' onClick={() => this.setState({edit: true, label: 'Linkedin', field: 'user linkedin', value: this.props.user.user_linkedin})} />
                    <FontAwesomeIcon icon={faGlobe} id='edit-user-website' className='edit-user-social-media-button' size='2x' onClick={() => this.setState({edit: true, label: 'Website', field: 'user website', value: this.props.user.user_website})} />
                </div>

                {input}
            </div>
        )
    }
}

EditUser.propTypes = {
    user: PropTypes.object.isRequired,
    status: PropTypes.string
}

export default connect()(EditUser);