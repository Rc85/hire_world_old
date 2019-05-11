import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faEdit } from '@fortawesome/pro-solid-svg-icons';
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
import { ShowSelectionModal, ResetSelection, ResetSelectionConfirm } from '../../../actions/SelectModalActions';
import { ShowLoading, HideLoading } from '../../../actions/LoadingActions';

class ViewUserReviewRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            editing: false,
            status: '',
            statusMessage: '',
            reviewReported: this.props.reported
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.selection.data.action) {
            if (!prevProps.selection.selected && !this.props.selection.selected && this.props.selection.confirm) {
                this.props.dispatch(Alert('error', 'Please select a reason'));
                this.props.dispatch(ResetSelectionConfirm());
            } else if (this.props.selection.confirm !== prevProps.selection.confirm) {
                if (this.props.selection.data.action === 'report review' && this.props.selection.selected && this.props.selection.confirm && this.props.selection.data.id === this.props.review.review_id) {
                    this.submitReport(this.props.selection.selected, this.props.selection.specified);
                    this.props.dispatch(ResetSelection());
                }
            }
        }
    }
    
    submitReport(reason, specified) {
        this.props.dispatch(ShowLoading('Sending report'));

        fetch.post('/api/report/submit', {url: this.props.review.review_id, type: 'Review', reason: reason, specified: specified === '' ? null : specified})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({reviewReported: true});
            }

            this.props.dispatch(HideLoading());
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/report/submit');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    edit(review, star) {
        this.setState({editing: false});
        this.props.edit(review, this.props.review.review_id, star);
    }
    
    render() {
        let buttons, badge, review, status, reviewer, reportButton, reviewUserType;

        if (this.props.user.user && this.props.user.user.username === this.props.review.reviewer) {
            buttons = <FontAwesomeIcon icon={faEdit} onClick={() => this.setState({editing: true})} className='user-review-buttons' />;
            reviewer = true;
        } else {
            reviewer = false;
        }

        if (this.props.review.token_review_id) {
            badge = <Badge text='Job Complete Verified' count={parseInt(this.props.review.review_count)} className='badge-primary user-review-badge' />
        }

        if (this.props.user.user && this.props.review && this.props.review.reviewer !== this.props.user.user.username) {
            if (!this.state.reviewReported) {
                reportButton = <Tooltip text='Report' placement='left'><FontAwesomeIcon icon={faExclamationTriangle} size='sm' className='view-button text-warning' onClick={() => this.props.dispatch(ShowSelectionModal(`Please select a reason`, ['Inappropriate', 'Spam', 'Defamation', 'Suspicious', 'Irrelevant'], {action: 'report review', id: this.props.review.review_id}))} /></Tooltip>;
            } else {
                reportButton = <Tooltip text='Reported' placement='left'><FontAwesomeIcon icon={faExclamationTriangle} size='sm' className='text-dark' /></Tooltip>;
            }
        }

        if (this.state.editing) {
            review = <SubmitReview submit={(review, star) => this.edit(review, star)} cancel={() => this.setState({editing: false})} review={this.props.review} stars={this.props.review.review_rating} />;
        } else {
            review = <div className='user-review'>
                <div className='user-review-body'>{this.props.review.review}</div>
            </div>;
        }

        return(
            <div className={`simple-container mb-3 ${this.props.user.user && this.props.review.reviewer === this.props.user.user.username ? 'bg-alt-highlight text-black' : ''}`}>
                <div className='simple-container-title'><Username username={this.props.review.reviewer} /></div>

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

                <div className={`user-review-container ${reviewer ? 'user-review-owner' : ''}`}>
                    <div className='user-review-profile-pic'>
                        <div className='profile-pic' style={{background: `url(${this.props.review.avatar_url}) center top / cover`}}></div>
                    </div>
    
                    {review}
                </div>

                <div className='user-review-footer'>
                    <div className='view-buttons'>{reportButton}</div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        selection: state.Selection
    }
}

export default withRouter(connect(mapStateToProps)(ViewUserReviewRow));