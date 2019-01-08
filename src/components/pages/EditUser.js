import React, { Component } from 'react';
import UserInfo from '../includes/page/UserInfo';
import { NavLink } from 'react-router-dom';
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
import { faBuilding, faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import SlideToggle from '../utils/SlideToggle';
import Badge from '../utils/Badge';
import { faCog, faBell, faListUl, faSlidersH, faCogs } from '@fortawesome/free-solid-svg-icons';
import { LogoutUser } from '../../actions/LoginActions';

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
    
    render() {
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
                    {n.notification_message}
                    <div className='w-25'>{n.notification_status === 'New' ? <small className='badge badge-success'>New</small> : ''}</div>
                </div>

                <div className='d-flex-between-center'>
                    <div className='w-25'><small className={`badge ${type}`}>{n.notification_type}</small></div>
                    <div className='w-75 text-right'><small>{moment(n.notification_date).format('MM-DD-YYYY h:mm:ss A')}</small></div>
                </div>

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
                <div className='titled-container-row-title'>
                    {a.activity_action}
                </div>

                <div className='titled-container-row-detail'>
                    <div>
                        <Badge className={type}
                        items={[
                            {text: a.activity_type},
                            {text: moment(a.activity_date).format('MM-DD-YYYY h:mm:ss A')}
                        ]} />
                    </div>
                </div>

                {i + 1 !== this.state.activities.length ? <hr /> : ''}
            </div>
        });

        return(
            <section id='edit-user' className='main-panel'>
                <div id='dashboard-header'>
                    <div id='dashboard-header-wrapper'>
                        <div className='profile-pic-wrapper'><UserProfilePic url={this.props.user.user.avatar_url} editable bordered /></div>

                        {this.props.user.user.user_business_name ? <h1 className='ml-2'><FontAwesomeIcon icon={faBuilding} className='text-special mr-1' /> {this.props.user.user.user_business_name}</h1> : ''}
                    </div>

                    <div id='dashboard-list-buttons-container'>
                        <FontAwesomeIcon icon={faCogs} size='2x' className='dashboard-list-button' />
                        <SlideToggle />
                        <button id='mobile-logout-button' className='btn btn-secondary' onClick={() => this.props.dispatch(LogoutUser())}>Logout</button>
                    </div>
                </div>

                <hr/>

                <div id='dashboard-panel-container'>
                    <div id='notifications-panel' className='dashboard-panel-half'>
                        <TitledContainer title='Notifications' bgColor='purple' shadow scroll={this.state.notifications.length > 0 ? true : false} icon={<FontAwesomeIcon icon={faBell} />}>
                            {notificationStatus}
                            {this.state.notifications.length > 0 ? notifications : <h5 className='text-muted text-center'>No notifications</h5>}
                            {!this.state.notificationsFetched ? <div className='load-more-button'><button className='btn btn-primary btn-sm' onClick={() => this.setState({notificationOffset: this.state.notificationOffset + 5})}>Load more</button></div> : ''}
                        </TitledContainer>
                    </div>

                    <div id='activities-panel' className='dashboard-panel-half'>
                        <TitledContainer title='Recent Activities' bgColor='orange' shadow scroll={this.state.activities.length > 0 ? true : false} icon={<FontAwesomeIcon icon={faListUl} />}>
                            {activityStatus}
                            {this.state.activities.length > 0 ? activities : <h5 className='text-muted text-center'>No activities</h5>}
                            {!this.state.activitiesFetched ? <div className='load-more-button'><button className='btn btn-primary btn-sm' onClick={() => this.setState({activityOffset: this.state.activityOffset + 5})}>Load more</button></div> : ''}
                        </TitledContainer>
                    </div>

                    <div id='upcoming-events-panel' className='dashboard-panel-full'>
                        <TitledContainer title='Upcoming Events' bgColor='lime' shadow icon={<FontAwesomeIcon icon={faCalendarAlt} />}>
                            <h5 className='text-muted text-center'>No upcoming events</h5>
                        </TitledContainer>
                    </div>
                </div>

                {/* <div className='row'>
                    <div className='col-2'>
                        <UserProfilePic url={this.props.user.user ? this.props.user.user.avatar_url : ''} editable={true} />

                        <hr/>

                        <div id='user-profile'>
                            {fullName}
                            {email}
                            {phone}
                            {address}
                            <UserTitle user={this.props.user} />
                            <hr/>
                            {<UserInfo label='Education' value={this.props.user.user ? this.props.user.user.user_education : ''} type='user_education' status={userEducationStatus} />
                            <hr/>}
                            <UserInfo label='Github' value={this.props.user.user ? this.props.user.user.user_github : ''} />
                            <hr/>
                            <UserInfo label='Twitter' value={this.props.user.user ? this.props.user.user.user_twitter : ''} />
                            <hr/>
                            <UserInfo label='Facebook' value={this.props.user.user ? this.props.user.user.user_facebook : ''} />
                            <hr/>
                            <UserInfo label='Instagram' value={this.props.user.user ? this.props.user.user.user_instagram : ''} />
                            <hr/>
                            <UserInfo label='LinkedIn' value={this.props.user.user ? this.props.user.user.user_linkedin : ''} />
                            <hr/>
                            <UserInfo label='Website' value={this.props.user.user ? this.props.user.user.user_website : ''} />
                        </div>
                    </div>
                    
                    <div className='col-10'>
                        <NavLink to={`/user/${this.props.user.user ? this.props.user.user.username : ''}`}><h1 className='m-0'>{this.props.user.user ? this.props.user.user.username : ''}</h1></NavLink>
                        {businessName}

                        <hr/>

                        <div className='d-flex-between-start'>
                            <div className='position-relative w-45'>
                                <TitledContainer title='Notifications' content={notifications} hasMore={this.state.notificationsFetched === false} loadMore={() => this.setState({notificationOffset: this.state.notificationOffset + 10})} emptyMessage={`You don't any have notifications`} withScroll={true} />
                                {notificationStatus}
                            </div>

                            <div className='position-relative w-45'>
                                <TitledContainer title='Recent Activities' content={activities} hasMore={this.state.activitiesFetched === false} loadMore={() => this.setState({activityOffset: this.state.activityOffset + 10})} emptyMessage={`You don't have any activities`} withScroll={true} />
                                {activityStatus}
                            </div>
                        </div>
                    </div>
                </div> */}
            </section>
        )
    }
}

EditUser.propTypes = {
    user: PropTypes.object.isRequired,
    status: PropTypes.string
}

const mapStateToProps = state => {
    return {
        user: state.Login
    }
}

export default connect(mapStateToProps)(EditUser);