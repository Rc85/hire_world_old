import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReviewButton from '../../utils/ReviewButton';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { Alert } from '../../../actions/AlertActions';
import Loading from '../../utils/Loading';
import fetch from 'axios';
import SubmitReview from './SubmitReview';
import { connect } from 'react-redux';
import { LogError } from '../../utils/LogError';
import { PromptOpen, PromptReset } from '../../../actions/PromptActions';
import UserProfilePic from './UserProfilePic';

class MessageRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {

        }
    }

    render() {
        return(
            <React.Fragment>
                {this.props.author !== 'system' ? <div className={`message-row-username ${this.props.author === 'owner' ? 'right' : 'left'}`}><NavLink to={`/user/${this.props.message.message_sender}`}>{this.props.message.message_sender}</NavLink></div> : ''}

                <div className={`message-row ${this.props.author}`}>
                    {this.props.message.message_sender != 'System' ? <div className='message-row-profile-pic'><UserProfilePic url={this.props.message.avatar_url} /></div> : ''}
                    <div className='message-container'>
                        <div className={`message-row-body ${this.props.type}`}>
                            {this.props.message.message_status === 'New' && this.props.message.message_recipient === this.props.user.user.username ? <span className='new-message-status mini-badge mini-badge-success'>{this.props.message.message_status}</span> : ''}
                            {this.props.message.message_body}
    
                            {this.props.type === 'confirmation' || this.props.type === 'abandonment' ? <div className='message-row-buttons'><button className='btn btn-success' onClick={() => this.props.approve()}>Approve</button><button className='btn btn-danger' onClick={() => this.props.decline()}>Decline</button></div> : ''}
                        </div>
        
                        <div className={`message-row-footer ${this.props.author}`}>
                            {this.props.message.message_sender === 'System' || this.props.message.message_sender === this.props.user.user.username ? 'Sent' : 'Received'} {moment(this.props.message.message_date).fromNow()}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

/* class MessageRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            review: false,
            status: '',
            star: 0,
            starActive: 0,
            notReviewed: this.props.message.token_status && this.props.message.token_status === 'Valid'
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.prompt.data.action === 'appeal' && nextProps.prompt.data.id === this.props.message.job_id) {
            this.appealAbandon(nextProps.prompt.input);
            this.props.dispatch(PromptReset());
        }
    }
    
    submit(review, message, star) {
        this.setState({status: 'Sending'});

        fetch.post('/api/user/review/submit', {review: review, message, star: star})
        .then(resp => {
            let notReviewed = true;
            
            if (resp.data.status === 'success') {
                notReviewed = false;
            }

            this.setState({status: '', review: false, notReviewed: notReviewed});
            
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/user/review/submit'));
    }

    appealAbandon(val) {
        this.setState({status: 'Sending'});

        fetch.post('/api/jobs/appeal-abandon', {job_id: this.props.message.job_id, additional_info: val})
        .then(resp => {
            this.setState({status: ''});

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/jobs/appeal-abandon'));
    }
    
    render() {
        let statusButton, statusButtonClass, reviewButton, review, status, pinnedButton, appealButton;

        if (this.state.status === 'Sending') {
            status = <Loading size='5x' />;
        }

        if (this.props.message.job_status !== 'Viewed') {
            if (this.props.message.job_status === 'Closed' || this.props.message.job_status === 'Abandoned') {
                statusButtonClass = 'danger';
            } else if (this.props.message.job_status === 'Incomplete' || this.props.message.job_status === 'Abandoning') {
                appealButton = <button className='btn btn-primary btn-sm mr-1' onClick={() => this.props.dispatch(PromptOpen('Are there any additional information you would like to add?', {action: 'appeal', id: this.props.message.job_id}))}>Appeal</button>
                statusButtonClass = 'warning';
            } else if (this.props.message.job_status === 'Complete') {
                statusButtonClass = 'success';

                if (this.state.notReviewed) {
                    reviewButton = <ReviewButton review={() => this.setState({review: true})}/>;
                } else {
                    reviewButton = <ReviewButton reviewed />;
                }
            } else if (this.props.message.job_status === 'New') {
                statusButtonClass = 'primary';
            }

            if (this.props.message.job_status !== 'Active') {
                statusButton = <span className={`badge badge-${statusButtonClass}`}>{this.props.message.job_status}</span>;

                if (this.props.message.job_status === 'New' && this.props.message.job_user !== this.props.user.username) {
                    statusButton = '';
                }
            }
        }

        if (this.state.review) {
            review = <SubmitReview submit={(review, star) => this.submit(review, this.props.message, star)} cancel={() => this.setState({review: false})} user={this.props.user} message={this.props.message} />;
        }

        if (this.props.type !== 'deleted') {
            if (!this.props.pinned) {
                pinnedButton = <button className='btn btn-link btn-sm mr-1' onClick={() => this.props.pin()}><FontAwesomeIcon icon={faThumbtack} color='white' /></button>;
            } else {
                pinnedButton = <button className='btn btn-link btn-sm mr-1' onClick={() => this.props.pin()}><FontAwesomeIcon icon={faThumbtack} color='#ffc107' /></button>;
            }
        }

        return(
            <React.Fragment>
                <div className='d-flex-between-start mb-3'>
                    {status}
                    <div className='w-5'><input type='checkbox' name='select-message' id={this.props.message.job_id} className='select-message-checkbox' onChange={(e) => this.props.select(e.target.value)}/></div>
                    <div className='w-5'>{this.props.message.job_id}</div>
                    <div className='w-70'>
                        <div className='user-message-subject'><NavLink to={`/message/${this.props.stage}/${this.props.message.job_id}/details`}>{this.props.message.job_subject}</NavLink>{this.props.message.unread_messages > 0 ? <span className='badge badge-danger ml-2'>{this.props.message.unread_messages}</span> : ''}</div>
    
                        <div><small>{this.props.user && this.props.message.message_sender === this.props.user.username ? <span>Sent {moment(this.props.message.message_date).fromNow()} to <NavLink to={`/user/${this.props.message.message_recipient}`}>{this.props.message.message_recipient}</NavLink></span> : <span>Received {moment(this.props.message.message_date).fromNow()} from <NavLink to={`/user/${this.props.message.message_sender}`}>{this.props.message.message_sender}</NavLink></span>}</small></div>
                    </div>
                    <div className='w-10'>{statusButton}</div>
                    <div className='w-10 d-flex-end-center'>
                        {reviewButton}
                        {appealButton}
                        {pinnedButton}
                    </div>
                </div>
                {review}
            </React.Fragment>
        )
    }
}

MessageRow.propTypes = {
    user: PropTypes.object,
    stage: PropTypes.string,
    message: PropTypes.object,
    select: PropTypes.func,
    delete: PropTypes.func,
    type: PropTypes.string,
    pin: PropTypes.func
} */

const mapStateToProps = state => {
    return {
        prompt: state.Prompt,
        user: state.Login
    }
}

export default connect(mapStateToProps)(MessageRow);