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
import { UncontrolledTooltip } from 'reactstrap';

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
            .catch(err => console.log(err));
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
        .catch(err => console.log(err));
    }
    
    render() {
        let buttons, badge, review, status, reviewer, reportButton;

        if (this.state.status === 'Sending') {
            status = <Loading size='3x' />;
        }

        if (this.props.user && this.props.user.username === this.props.review.reviewer) {
            buttons = <div>
                <FontAwesomeIcon icon={faEdit} onClick={() => this.setState({editing: true})} className='review-buttons' />
            </div>;
            reviewer = true;
        } else {
            reviewer = false;
        }

        if (this.props.review.review_token) {
            badge = <span className='badge badge-success'>Job Complete Verified</span>;
        }

        if (this.props.user && this.props.review && this.props.review.reviewer !== this.props.user.username) {
            if (!this.state.reviewReported) {
                reportButton = <FontAwesomeIcon icon={faExclamationTriangle} size='sm' className='review-buttons' onClick={() => this.submitReport()} />;
            } else {
                reportButton = <span>
                    <FontAwesomeIcon icon={faExclamationTriangle} size='sm' className='theme-darkgrey' id={`report-button-${this.props.review.review_id}`} />
                    <UncontrolledTooltip placement='top' target={`report-button-${this.props.review.review_id}`}>Already reported</UncontrolledTooltip>
                </span>;
            }
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
                        
                        <span className='review-date-time'>{badge} Submitted on {moment(this.props.review.review_date).format('MMM DD YYYY')} {this.props.review.review_modified_date ? <span>(Edited)</span> : '' }</span>
                    </div>

                    {buttons}
                </div>

                <div className='review-body'>{this.props.review.review}</div>

                <div className='mt-5 text-right'>
                    {reportButton}
                </div>
            </div>;
        }

        return(
            <React.Fragment>
                <div className={reviewer ? 'd-flex-between-start mx-auto w-75 p-2 mb-5 review-owner' : 'd-flex-between-start mx-auto w-75 p-2'}>
                    {status}
                    <div className='text-center w-10'>
                        <div className='profile-pic' style={{background: `url(${this.props.review.avatar_url}) center top / cover`}}></div>
                        <span><NavLink to={`/user/${this.props.review.reviewer}`}>{this.props.review.reviewer}</NavLink></span>
                    </div>
    
                    {review}
                </div>

                {reviewer ? '' : <hr className='w-75 mx-auto mb-5' />}
            </React.Fragment>
        )
    }
}

export default withRouter(connect()(ViewUserReview));