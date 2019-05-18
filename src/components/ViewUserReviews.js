import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'axios';
import { LogError } from './utils/LogError';
import SubmitReview from './SubmitReview';
import ViewUserReviewRow from './ViewUserReviewRow';
import { Alert } from '../actions/AlertActions';
import { connect } from 'react-redux';
import Pagination from './utils/Pagination';

class ViewUserReviews extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Fetching',
            offset: 0,
            reviews: [],
            submitReview: false,
            reportedReviews: [],
            totalReviews: 0,
            reviewSubmitted: true
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.offset !== this.state.offset) {
            this.setState({status: 'Fetching'});

            fetch.post('/api/get/reviews', {user: this.props.username, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', reviews: resp.data.reviews});
                } else if (resp.data.status === 'error') {
                    this.setState({status: 'error'});
                }
            })
            .catch(err => LogError(err, '/api/get/reviews'));
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/reviews', {user: this.props.username, offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', reviews: resp.data.reviews, totalReviews: parseInt(resp.data.totalReviews), reportedReviews: resp.data.reportedReviews, reviewSubmitted: resp.data.reviewSubmitted});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => LogError(err, '/api/get/reviews'));
    }

    submitReview(review, star) {
        let blankCheck = /^\s*$/;

        if (blankCheck.test(review)) {
            this.props.dispatch(Alert('error', 'Review cannot be blank'));
        } else {
            this.setState({status: 'Submitting Review'});

            fetch.post('/api/review/submit', {review: review, star: star, reviewing: this.props.username, id: this.props.listingId})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let reviews = [...this.state.reviews];

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

    editReview(message, review_id, star, index) {
        let blankCheck = /^\s*$/;

        this.setState({status: 'Sending'});

        if (blankCheck.test(message)) {
            this.props.dispatch(Alert('error', 'Review cannot be blank'));
        } else {
            fetch.post('/api/review/edit', {message: message, star: star, review_id: review_id})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let reviews = [...this.state.reviews];
                    reviews[index] = resp.data.review;

                    this.setState({status: '', reviews: reviews});
                }
                
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            })
            .catch(err => LogError(err, '/api/review/edit'));
        }
    }
    
    render() {
        return (
            <div id='user-reviews'>
                <div className='text-right'>
                    {!this.state.submitReview && this.props.user.user && this.props.username !== this.props.user.user.username ? <button className='btn btn-primary' onClick={() => this.setState({submitReview: true})}>Submit Review</button> : ''}
                </div>

                <div className='mb-5'>{this.state.submitReview ? <SubmitReview cancel={() => this.setState({submitReview: false})} submit={(review, stars) => this.submitReview(review, stars)} /> : ''}</div>

                {parseInt(this.state.reviews.length) > 0 ? <div className='mb-3'><Pagination totalItems={this.state.totalReviews} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} /></div> : ''}

                <div className='user-reviews-container'>
                    {this.state.reviews.length > 0 ? this.state.reviews.map((review, i) => {
                        let reported = this.state.reportedReviews.indexOf(review.review_id.toString()) >= 0;

                        return <ViewUserReviewRow key={review.review_id} review={review} user={this.props.user} edit={(review, id, star) => this.editReview(review, id, star, i)} reported={reported} />;
                    }) : <h1 className='text-dark text-center'>No Reviews</h1>}
                </div>

                {parseInt(this.state.reviews.length) > 0 ? <Pagination totalItems={this.state.totalReviews} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} /> : ''}
            </div>
        );
    }
}

ViewUserReviews.propTypes = {
    user: PropTypes.object,
    username: PropTypes.string,
    listingId: PropTypes.string
};

export default connect()(ViewUserReviews);