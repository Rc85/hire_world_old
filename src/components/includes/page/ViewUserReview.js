import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faEdit } from '@fortawesome/free-solid-svg-icons';
import UserRating from './UserRating';
import SubmitReview from './SubmitReview';
import { Alert } from '../../../actions/AlertActions';
import Loading from '../../utils/Loading';
import fetch from 'axios';
import moment from 'moment';
import { connect } from 'react-redux';
import { LogError } from '../../utils/LogError';
import Tooltip from '../../utils/Tooltip';
import Badge from '../../utils/Badge';
import Username from './Username';

class ViewUserReview extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            editing: false,
            status: '',
            statusMessage: '',
            reviewReported: this.props.reported
        }
    }

    editReview(message, review_id, star) {
        let blankCheck = /^\s*$/;

        this.setState({status: 'Sending'});

        if (blankCheck.test(message)) {
            this.props.dispatch(Alert('error', 'Review cannot be blank'));
        } else {
            fetch.post('/api/review/edit', {message: message, star: star, review_id: review_id})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', editing: false});
                    this.props.edit(resp.data.review);
                }
                
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            })
            .catch(err => LogError(err, '/api/review/edit'));
        }
    }

    submitReport() {
        this.setState({status: 'Sending'});

        fetch.post('/api/report/submit', {id: this.props.review.review_id, type: 'Review', url: this.props.location.pathname, user: this.props.review.reviewer})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', reviewReported: true});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/report/submit'));
    }
    
    render() {
        let buttons, badge, review, status, reviewer, reportButton;

        if (this.state.status === 'Sending') {
            status = <Loading size='3x' />;
        }

        if (this.props.user && this.props.user.username === this.props.review.reviewer) {
            buttons = <FontAwesomeIcon icon={faEdit} onClick={() => this.setState({editing: true})} className='user-review-buttons' />;
            reviewer = true;
        } else {
            reviewer = false;
        }

        if (this.props.review.review_token) {
            badge = <Badge items={[
                {text: this.props.review.job_client === this.props.review.reviewer ? 'I Hired' : 'I Was Hired'},
                {text: 'Job Complete Review'}
            ]} className='badge-success text-black user-review-badge' />;
        }

        if (this.props.user && this.props.review && this.props.review.reviewer !== this.props.user.username) {
            if (!this.state.reviewReported) {
                reportButton = <Tooltip text='Report' placement='left'><FontAwesomeIcon icon={faExclamationTriangle} size='sm' className='text-highlight' onClick={() => this.submitReport()} /></Tooltip>;
            }
        }

        if (this.state.editing) {
            review = <SubmitReview submit={(review, star) => this.props.edit(review, this.props.review.review_id, star)} cancel={() => this.setState({editing: false})} review={this.props.review.review} stars={this.props.review.review_rating} show />;
        } else {
            review = <div className='user-review'>
                <div className='user-review-header'>
                    <div className='user-review-header-info'>
                        <div className='user-review-rating'>
                            <UserRating rating={this.props.review.review_rating} />
                        </div>
                        
                        {badge}
                        
                        <small>Submitted on {moment(this.props.review.review_date).format('MMM DD YYYY')} {this.props.review.review_modified_date ? <span>(Edited)</span> : '' }</small>
                    </div>

                    {buttons}
                </div>

                <div className='user-review-body'>{this.props.review.review}</div>

                <div className='user-review-footer'>
                    {reportButton}
                </div>
            </div>;
        }

        return(
            <React.Fragment>
                <div className={`user-review-container ${reviewer ? 'user-review-owner' : ''}`}>
                    {status}
                    <div className='user-review-profile-pic'>
                        <div className='profile-pic' style={{background: `url(${this.props.review.avatar_url}) center top / cover`}}></div>
                        <span><Username username={this.props.review.reviewer} color='highlight' /></span>
                    </div>
    
                    {review}
                </div>

                <hr className='user-review-separator' />
            </React.Fragment>
        )
    }
}

export default withRouter(connect()(ViewUserReview));