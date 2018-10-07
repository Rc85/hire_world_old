import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faEdit } from '@fortawesome/free-solid-svg-icons';
import UserRating from './UserRating';
import SubmitReview from './SubmitReview';
import Alert from '../../utils/Alert';
import Loading from '../../utils/Loading';
import fetch from 'axios';

class ViewUserReview extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            editing: false,
            status: '',
            statusMessage: ''
        }
    }

    editReview(message, review_id, star) {
        let blankCheck = /^\s*$/;

        if (blankCheck.test(message)) {
            this.setState({status: 'error', statusMessage: 'Review cannot be blank'});
        } else {
            fetch.post('/api/review/edit', {message: message, star: star, review_id: review_id})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage, editing: false});
                    this.props.edit(resp.data.review);
                } else if (resp.data.status === 'error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => console.log(err));
        }
    }
    
    render() {
        console.log(this.props)
        let buttons, badge, review, status;

        if (this.state.status === 'success' || this.state.status === 'error') {
            status = <Alert status={this.state.status} message={this.state.message} unmount={() => this.setState({status: '', statusMessage: ''})} />;
        } else if (this.state.status === 'Sending') {
            status = <Loading size='3x' />;
        }

        if (this.props.user && this.props.user.username === this.props.review.reviewer) {
            buttons = <div>
                <FontAwesomeIcon icon={faEdit} onClick={() => this.setState({editing: true})} className='review-buttons' />
            </div>
        }

        if (this.props.review.review_token) {
            badge = <span className='badge badge-success'>Job Complete Verified</span>;
        }

        if (this.state.editing) {
            review = <div className='w-85'>
                <SubmitReview submit={(review, star) => this.editReview(review, this.props.review.review_id, star)} cancel={() => this.setState({editing: false})} review={this.props.review.review} stars={this.props.review.review_rating} />
            </div>;
        } else {
            review = <div className='w-85'>
                <div className='d-flex-between-center mb-5'>
                    <div className='d-flex-center'>
                        <div className='d-flex mr-2'>
                            <UserRating rating={this.props.review.review_rating} />
                        </div>
                        
                        <span className='review-date-time'>{badge} Submitted on {this.props.review.review_date} {this.props.review.review_modified_date ? <span>(Edited)</span> : '' }</span>
                    </div>

                    {buttons}
                </div>

                <div className='review-body'>{this.props.review.review}</div>

                <div className='mt-5 text-right'>
                    <NavLink to={`/review/report/${this.props.review.review_id}`}><FontAwesomeIcon icon={faExclamationTriangle} size='sm' /></NavLink>
                </div>
            </div>;
        }

        return(
            <React.Fragment>
                <div className='d-flex-between-start mx-auto w-75'>
                    {status}
                    <div className='text-center w-10'>
                        <div className='profile-pic' style={{background: `url(${this.props.review.avatar_url}) center top / cover`}}></div>
                        <span><NavLink to={`/user/${this.props.review.reviewer}`}>{this.props.review.reviewer}</NavLink></span>
                    </div>
    
                    {review}
                </div>

                <hr className='w-75 mx-auto mb-5' />
            </React.Fragment>
        )
    }
}

export default ViewUserReview;