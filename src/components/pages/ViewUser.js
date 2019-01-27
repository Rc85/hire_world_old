import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ViewUserContacts from '../includes/page/ViewUserContacts';
import ViewUserProfile from '../includes/page/ViewUserProfile';
import { withRouter, Redirect } from 'react-router-dom';
import fetch from 'axios';
import Loading from '../utils/Loading';
import ViewUserReview from '../includes/page/ViewUserReview';
import SubmitReview from '../includes/page/SubmitReview';
import { Alert } from '../../actions/AlertActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faEye, faExclamationTriangle, faHeart, faCoins, faUserPlus, faUserMinus, faBan } from '@fortawesome/free-solid-svg-icons';
import ViewUserBusinessHours from '../includes/page/ViewUserBusinessHours';
import { connect } from 'react-redux';
import { LogError } from '../utils/LogError';
import MessageSender from '../includes/page/MessageSender';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import TitledContainer from '../utils/TitledContainer';
import Tooltip from '../utils/Tooltip';

class ViewUser extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            reviews: [],
            status: '',
            submitReview: false,
            review: '',
            hours: {},
            reportedReviews: [],
            userReported: false,
            isFriend: false,
            stats: {
                view_count: 0,
                job_complete: 0,
                job_abandon: 0,
                last_login: null
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.key !== this.props.location.key) {
            this.setState({status: 'Loading'});

            fetch.post('/api/get/user', {username: this.props.match.params.username})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({user: resp.data.user, reviews: resp.data.reviews, stats: resp.data.stats, hours: resp.data.hours, status: '', reportedReviews: resp.data.reports, userReported: resp.data.userReported, isFriend: resp.data.isFriend});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                } else if (resp.data.status === 'access error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => LogError(err, '/api/get/user'));
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Loading'});

        fetch.post('/api/get/user', {username: this.props.match.params.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({user: resp.data.user, reviews: resp.data.reviews, stats: resp.data.stats, hours: resp.data.hours, status: '', reportedReviews: resp.data.reports, userReported: resp.data.userReported, isFriend: resp.data.isFriend});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            } else if (resp.data.status === 'access error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => LogError(err, '/api/get/user'));
    }

    submitReview(review, star) {
        let blankCheck = /^\s*$/;

        if (blankCheck.test(review)) {
            this.props.dispatch(Alert('error', 'Review cannot be blank'));
        } else {
            this.setState({status: 'Sending'});

            fetch.post('/api/review/submit', {review: review, star: star, reviewing: this.state.user.username})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let reviews = this.state.reviews;

                    if (resp.data.review) {
                        reviews.unshift(resp.data.review);
                    }

                    this.setState({status: '', reviews: reviews, submitReview: false});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                }
            
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            })
            .catch(err => LogError(err, '/api/review/submit'));
        }
    }

    editReview(review, index) {
        let reviews = this.state.reviews;
        reviews[index] = review;

        this.setState({reviews: reviews});
    }

    submitReport() {
        this.setState({status: 'Sending'});

        fetch.post('/api/report/submit', {id: this.state.user.user_id, type: 'User', url: this.props.location.pathname, user: this.state.user.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', userReported: true});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            } else if (resp.data.status === 'redirect') {
                this.setState({status: resp.data.status});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/report/submit'));
    }

    sendMessage(message, subject) {
        this.setState({status: 'Sending', sendStatus: ''});

        fetch.post('/api/message/submit', {subject: subject, message: message, user: this.state.user})
        .then(resp => {
            this.setState({status: '', sendStatus: resp.data.status});

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/message/submit'));
    }

    friendUser(action) {
        this.setState({status: 'Adding'});

        fetch.post('/api/user/friend', {user: this.state.user.username, action: action})
        .then(resp => {
            if (resp.data.status === 'success') {
                let isFriend;

                if (action === 'add') {
                    isFriend = true;
                } else if (action === 'remove') {
                    isFriend = false;
                }

                this.setState({status: '', isFriend: isFriend});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        });
    }

    render() {
        let status, contacts, profile, reviews, submitReviewButton, reviewed, reportButton, message, friendIcon, businessHours;

        if (this.state.status === 'access error') {
            return <Redirect to={`/error/404`} />
        } else if (this.state.status === 'Loading') {
            return <Loading size='7x' />;
        } else if (this.state.status === 'redirect') {
            return <Redirect to='/' />;
        }

        if (this.state.reviews && this.props.user) {
            reviewed = this.state.reviews.findIndex(review => review.reviewer === this.props.user.username)
        }

        if (this.state.status === 'Sending') {
            status = <Loading size='5x' />;
        }

        if (this.state.user) {
            contacts = <ViewUserContacts user={this.state.user} />;
            profile = <ViewUserProfile user={this.state.user} stats={this.state.stats} hours={this.state.hours} />;

            if (this.state.user.display_business_hours) {
                businessHours = <ViewUserBusinessHours hours={this.state.hours} />;
            }

            if (this.state.reviews.length > 0) {
                reviews = this.state.reviews.map((review, i) => {
                    let reported = false;

                    if (this.state.reportedReviews.indexOf(review.review_id) >= 0) reported = true;

                    return <ViewUserReview key={i} review={review} user={this.props.user} edit={(review) => this.editReview(review, i)} reported={reported} />
                });
            } else {
                reviews = <div className='text-center mt-5'>
                    <h1 className='text-muted'>Not Yet Reviewed</h1>
                </div>
            }

            if (!this.state.submitReview && this.props.user && this.state.user) {
                if (this.props.user.username !== this.state.user.username && reviewed < 0) {
                    submitReviewButton = <button className='btn btn-primary' onClick={() => this.setState({submitReview: true})}>Submit Review</button>;
                }
            }

            if (this.props.user && this.props.user.username !== this.state.user.username) {
                if (!this.state.isFriend) {
                    friendIcon = <Tooltip text='Add to Friends List' placement='bottom-right'><FontAwesomeIcon icon={faUserPlus} className='text-alt-highlight' onClick={() => this.friendUser('add')} /></Tooltip>;
                } else {
                    friendIcon = <Tooltip text='Remove from Friends List' placement='bottom-right'><FontAwesomeIcon icon={faUserMinus} className='text-alt-highlight' onClick={() => this.friendUser('remove')} /></Tooltip>
                }
                
                if (!this.state.userReported) {
                    reportButton = <Tooltip text='Report this user' placement='bottom-right'><FontAwesomeIcon icon={faExclamationTriangle} onClick={() => this.submitReport()} className='text-alt-highlight' /></Tooltip>;
                }

                if (this.state.user.username !== this.props.user.username && this.state.user.allow_messaging) {
                    message = <React.Fragment>
                        <hr/>

                        <MessageSender send={(message, subject) => this.sendMessage(message, subject)} status={this.state.sendStatus} className='mt-4' />
                    </React.Fragment>
                    ;
                }
            }
        }
        
        return(
            <div id='view-user' className='main-panel'>
                {status}
                
                <div id='view-user-details-container'>
                    <div id='view-user-main'>
                        <TitledContainer title={this.state.user ? this.state.user.username : ''} bgColor='purple' icon={<FontAwesomeIcon icon={faUserCircle} />} shadow>
                            {profile}

                            {message}

                            <hr/>
                            
                            <div id='view-user-footer'>
                                <div id='view-user-stats'>
                                    <div className='mr-5'>
                                        <Tooltip text='Job completed' placement='bottom'>
                                            <FontAwesomeIcon icon={faCheckCircle} className='text-success mr-2' />
                                            <span>{this.state.stats.job_complete}</span>
                                        </Tooltip>
                                    </div>
                        
                                    <div className='mr-5'>
                                        <Tooltip text='Job abandoned' placement='bottom'>
                                            <FontAwesomeIcon icon={faBan} className='text-danger mr-2' />
                                            <span>{this.state.stats.job_abandon}</span>
                                        </Tooltip>
                                    </div>
        
                                    <div className='mr-5'>
                                        <Tooltip text='Views' placement='bottom'>
                                            <FontAwesomeIcon icon={faEye} className='mr-2' />
                                            <span>{this.state.stats.view_count}</span>
                                        </Tooltip>
                                    </div>
                                </div>
        
                                <div className='view-user-buttons'>
                                    {friendIcon}
                                    {reportButton}
                                </div>
                            </div>
                        </TitledContainer>
                    </div>

                    <div id='view-user-details'>
                        {contacts}
                        {businessHours}
                    </div>
                </div>

                <div id='user-reviews-container'>
                    <div id='user-reviews-wrapper'>
                        <div className='mt-3'>
                            <div className='text-right'>{submitReviewButton}</div>
        
                            <SubmitReview submit={(review, star) => this.submitReview(review, star)} cancel={() => this.setState({submitReview: false })} className='mt-1' show={this.state.submitReview} />
                        </div>
        
                        <div id='user-reviews' className='mt-5'>
                            {reviews}
                        </div>
                    </div>

                    <div className='user-reviews-placeholder-column'></div>
                </div>
            </div>
        )
    }
}

ViewUser.propTypes = {
    user: PropTypes.object
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(ViewUser));