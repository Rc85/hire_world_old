import React, { Component } from 'react';
import ViewUserSocialMedia from '../includes/page/ViewUserSocialMedia';
import ViewUserContacts from '../includes/page/ViewUserContacts';
import ViewUserProfile from '../includes/page/ViewUserProfile';
import { withRouter, Redirect } from 'react-router-dom';
import fetch from 'axios';
import Loading from '../utils/Loading';
import Response from './Response';
import ViewUserStats from '../includes/page/ViewUserStats';
import ViewUserReview from '../includes/page/ViewUserReview';
import SubmitReview from '../includes/page/SubmitReview';
import { Alert } from '../../actions/AlertActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { UncontrolledTooltip } from 'reactstrap';
import { LogError } from '../utils/LogError';

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
            userReported: false
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.key !== this.props.location.key) {
            this.setState({status: 'Loading'});

            fetch.post('/api/get/user', {username: this.props.match.params.username})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({user: resp.data.user, services: resp.data.services, reviews: resp.data.reviews, stats: resp.data.stats, hours: resp.data.hours, status: '', reportedReviews: resp.data.reports, userReported: resp.data.userReported});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                }

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            })
            .catch(err => LogError(err, '/api/get/user'));
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Loading'});

        fetch.post('/api/get/user', {username: this.props.match.params.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({user: resp.data.user, reviews: resp.data.reviews, stats: resp.data.stats, hours: resp.data.hours, status: '', reportedReviews: resp.data.reports, userReported: resp.data.userReported});
            } else if (resp.data.status === 'error') {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            } else if (resp.data.status === 'error page') {
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

    render() {
        let status, contacts, socialMedia, profile, reviews, submitReview, submitReviewButton, name, reviewed, reportButton;

        if (this.state.reviews && this.props.user.user) {
            reviewed = this.state.reviews.findIndex(review => review.reviewer === this.props.user.user.username)
        }

        if (this.state.status === 'Sending') {
            status = <Loading size='5x' />;
        }

        if (this.state.user) {
            contacts = <ViewUserContacts user={this.state.user} />;
            socialMedia = <ViewUserSocialMedia user={this.state.user} listing={this.state.user ? {id: this.state.user.listing_id, status: this.state.user.listing_status} : {}} />;
            profile = <ViewUserProfile user={this.state.user} />;

            if (this.state.user.user_firstname && this.state.user.user_lastname) {
                name = <div className='d-flex mb-3'>
                    <div className='w-10 mr-1'><FontAwesomeIcon icon={faUserCircle} size='lg' className='view-user-icon' /></div> {this.state.user.user_firstname} {this.state.user.user_lastname}
                </div>;
            }
        }

        if (this.state.reviews.length > 0) {
            reviews = this.state.reviews.map((review, i) => {
                let reported = false;

                if (this.state.reportedReviews.indexOf(review.review_id) >= 0) reported = true;

                return <ViewUserReview key={i} review={review} user={this.props.user.user} edit={(review) => this.editReview(review, i)} reported={reported} />
            });
        } else {
            reviews = <div className='text-center mt-5'>
                <h1 className='text-muted'>Not Yet Reviewed</h1>
            </div>
        }

        if (this.state.submitReview) {
            submitReview = <SubmitReview submit={(review, star) => this.submitReview(review, star)} cancel={() => this.setState({submitReview: false })} />;
        } else if (!this.state.submitReview && this.props.user.user && this.state.user) {
            if (this.props.user.user.username !== this.state.user.username && reviewed < 0) {
                submitReviewButton = <button className='btn btn-primary' onClick={() => this.setState({submitReview: true})}>Submit Review</button>;
            }
        }

        if (this.state.status === 'error page') {
            return <Response header={'Error'} message={this.state.statusMessage} />;
        } else if (this.state.status === 'Loading') {
            return <Loading size='7x' />;
        } else if (this.state.status === 'redirect') {
            return <Redirect to='/account/login' />;
        }

        if (this.state.user && this.props.user.user && this.props.user.user.username !== this.state.user.username) {
            if (!this.state.userReported) {
                reportButton = <FontAwesomeIcon icon={faExclamationTriangle} size='xs' className='menu-button' onClick={() => this.submitReport()} />;
            } else {
                reportButton = <span>
                    <FontAwesomeIcon icon={faExclamationTriangle} size='xs' className='theme-bg' id='report-user-button' />
                    <UncontrolledTooltip placement='top' target='report-user-button'>Already reported</UncontrolledTooltip>    
                </span>;
            }
        }
        
        return(
            <div id='view-user' className='main-panel w-100'>
                {status}
                <div className='blue-panel shallow rounded'>
                    <div className='row'>
                        <div className='col-3'>
                            {name}
                            {contacts}
                            {socialMedia}
                            <ViewUserStats stats={this.state.stats || {}} hours={this.state.hours} />
                        </div>

                        <div className='col-9'>
                            {profile}
                        </div>
                    </div>

                    <div className='text-right'>{reportButton}</div>
                </div>

                <div className='text-right mt-3'>
                    <div className='w-75 mx-auto'>{submitReviewButton}</div>

                    <div className='mt-1'>
                        {submitReview}
                    </div>
                </div>

                <div id='user-reviews' className='mt-5'>
                    {reviews}
                </div>
            </div>
        )
    }
}

export default withRouter(connect()(ViewUser));