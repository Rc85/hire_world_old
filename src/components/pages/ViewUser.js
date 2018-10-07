import React, { Component } from 'react';
import ViewUserSocialMedia from '../includes/page/ViewUserSocialMedia';
import ViewUserContacts from '../includes/page/ViewUserContacts';
import ViewUserProfile from '../includes/page/ViewUserProfile';
import ViewUserServices from '../includes/page/ViewUserServices';
import { withRouter } from 'react-router-dom';
import fetch from 'axios';
import Loading from '../utils/Loading';
import Response from './Response';
import ViewUserStats from '../includes/page/ViewUserStats';
import ViewUserReview from '../includes/page/ViewUserReview';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import SubmitReview from '../includes/page/SubmitReview';
import Alert from '../utils/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

class ViewUser extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            reviews: [],
            status: '',
            submitReview: false,
            review: ''
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps);
    }

    componentDidUpdate(prevProps, prevState) {
        console.log(prevProps)
        if (prevProps.location.key !== this.props.location.key) {
            this.setState({status: 'Loading'});

            fetch.post('/api/get/user', {username: this.props.match.params.username})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({
                        user: resp.data.user, services: resp.data.services, reviews: resp.data.reviews, stats: resp.data.stats, status: ''
                    });
                } else {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => console.log(err));
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Loading'});

        fetch.post('/api/get/user', {username: this.props.match.params.username})
        .then(resp => {
            console.log(resp)
            if (resp.data.status === 'success') {
                this.setState({
                    user: resp.data.user, reviews: resp.data.reviews, stats: resp.data.stats, status: ''
                });
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    submitReview(review, star) {
        let blankCheck = /^\s*$/;

        if (blankCheck(review)) {
            this.setState({status: 'error', statusMessage: 'Review cannot be blank'});
        } else {
            this.setState({status: 'Loading'});

            fetch.post('/api/review/submit', {review: review, star: star, reviewing: this.state.user.username})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let reviews = this.state.reviews;
                    reviews.unshift(resp.data.review);

                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage, reviews: reviews, submitReview: false});
                } else if (resp.data.status === 'error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            });
        }
    }

    editReview(review, index) {
        let reviews = this.state.reviews;
        reviews[index] = review;

        this.setState({reviews: reviews});
    }

    render() {
        console.log(this.state)
        let status, contacts, socialMedia, profile, reviews, submitReview, submitReviewButton, name;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        } else if (this.state.status === 'success' || this.state.status === 'error') {
            status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />;
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
                return <ViewUserReview key={i} review={review} user={this.props.user.user} edit={(review) => this.editReview(review, i)} />
            });
        } else {
            reviews = <div className='text-center mt-5'>
                <h1 className='text-muted'>Not Yet Reviewed</h1>
            </div>
        }

        if (this.state.submitReview) {
            submitReview = <SubmitReview submit={(review, star) => this.submitReview(review, star)} cancel={() => this.setState({submitReview: false })} />;
        } else if (!this.state.submitReview && this.props.user.user && this.state.user) {
            if (this.props.user.user.username !== this.state.user.username) {
                submitReviewButton = <button className='btn btn-primary' onClick={() => this.setState({submitReview: true})}>Submit Review</button>;
            }
        }

        if (this.state.status === 'error page') {
            return(
                <Response header={'Error'} message={this.state.statusMessage} /> 
            )
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
                            <ViewUserStats stats={this.state.stats || {}} />
                        </div>

                        <div className='col-9'>
                            {profile}
                        </div>
                    </div>
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

export default withRouter(ViewUser);