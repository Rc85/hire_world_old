import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack, faGavel, faEllipsisH, faCheck, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { PromptOpen, PromptReset } from '../../../actions/PromptActions';
import { connect } from 'react-redux';
import ReviewButton from '../../utils/ReviewButton';
import SubmitReview from '../page/SubmitReview';

class InquiryRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            review: false
        }
    }
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.prompt.data.action === 'appeal' && nextProps.prompt.data.id === this.props.message.job_id && nextProps.prompt.input) {
            this.props.appeal(nextProps.prompt.input, nextProps.prompt.data.id);
            this.props.dispatch(PromptReset());
        }
    }

    submitReview(review, star) {
        this.props.submitReview(review, this.props.message, star);
        this.setState({review: false});
    }
    
    render() {
        console.log(this.props)
        let statusButton, pinnedButton, appealButton, review;
        
        if (this.props.message.job_stage !== 'Appealing') {
            if (this.props.pinned) {
                pinnedButton = <button className='btn btn-yellow btn-sm' onClick={() => this.props.pin()}><FontAwesomeIcon icon={faThumbtack} /></button>
            } else {
                pinnedButton = <button className='btn btn-grey btn-sm' onClick={() => this.props.pin()}><FontAwesomeIcon icon={faThumbtack} /></button>
            }
        }
        
        if (this.props.user) {
            if (this.props.message.job_status === 'New' && this.props.user.username === this.props.message.job_user) {
                statusButton = <span className='badge badge-primary'>{this.props.message.job_status}</span>;
            }
            
            if (this.props.message.job_stage === 'Abandoned' && this.props.user.username === this.props.message.job_user) {
                appealButton = <button className='btn btn-info btn-sm mr-1' onClick={() => this.props.dispatch(PromptOpen('Are there any additional information you would like to add?', {action: 'appeal', id: this.props.message.job_id}))} title='Appeal'><FontAwesomeIcon icon={faGavel} /></button>
            } else if (this.props.message.job_stage === 'Completed' && this.props.user.username === this.props.message.job_client) {
                if (this.props.message.token_status && this.props.message.token_status === 'Valid') {
                    appealButton = <ReviewButton review={() => this.setState({review: true})}/>;
                } else {
                    appealButton = <ReviewButton reviewed />;
                }
            } else if (this.props.message.job_stage === 'Appealing' && this.props.user.username === this.props.message.job_user) {
                if (this.props.message.job_status === 'Appealing') {
                    appealButton = <div className='badge badge-warning p-2' title='Pending'><FontAwesomeIcon icon={faEllipsisH} color='white' /></div>;
                } else if (this.props.message.job_status === 'Appealed') {
                    appealButton = <div className='badge badge-success p-2' title='Appealed'><FontAwesomeIcon icon={faCheck} color='white' /></div>
                }
            }
        }

        if (this.props.message.job_status === 'Completed' && this.props.message.job_client === this.props.user.username) {
            review = <SubmitReview submit={(review, star) => this.submitReview(review, star)} status={this.props.status} cancel={() => this.setState({review: false})} user={this.props.user} message={this.props.message} show={this.state.review} />
        }

        return (
            <div className='inquiry-row'>
                <div className='inquiry-main-row'>
                    <div className={`inquiry-row-text-wrapper ${this.props.loadedId === this.props.message.job_id ? 'active' : ''}`} onClick={() => this.props.load(this.props.message.job_id)}>
                        {this.props.message.job_status === 'New' && this.props.message.job_user === this.props.user.username ? <span className='mini-badge mini-badge-success'>{this.props.message.job_status}</span> : ''}

                        {this.props.message.job_subject}
                    </div>

                    <div className='inquiry-row-buttons'>{appealButton} {pinnedButton}</div>
                </div>

                <div className='inquiry-detail-row'>
                    {this.props.message.unread_messages > 0 ? <div className={`inquiry-detail-type-indicator`}>{this.props.message.unread_messages}</div> : ''}
                    <div className='inquiry-detail-type'>{this.props.user && this.props.message.job_client === this.props.user.username ? `To ${this.props.message.job_user} ${moment(this.props.message.job_created_date).fromNow()}` : `From ${this.props.message.job_client} ${moment(this.props.message.job_created_date).fromNow()}`}</div>
                </div>

                <div className={this.state.review ? 'verified-review-container' : ''}>{review}</div>

                {this.props.loadedId === this.props.message.job_id ? <FontAwesomeIcon icon={faCaretRight} size='3x' className='message-active-arrow' /> : ''}

            {/* <React.Fragment>
                <div className='d-flex-between-start mb-3'>
                    <div className='w-5'>{this.props.message.job_id}</div>
                    <div className='w-75'>
                        <NavLink to={`/message/${this.props.stage}/${this.props.message.job_id}/details`}>{this.props.message.job_subject}</NavLink>
                        {this.props.message.unread_messages > 0 ? <span className='badge badge-danger ml-2'>{this.props.message.unread_messages}</span> : ''}
    
                        <div>
                            <small>{this.props.user && this.props.message.job_client === this.props.user.username ? <span>Sent {moment(this.props.message.job_created_date).fromNow()} to <NavLink to={`/user/${this.props.message.job_user}`}>{this.props.message.job_user}</NavLink></span> : <span>Received {moment(this.props.message.job_created_date).fromNow()} from <NavLink to={`/user/${this.props.message.job_client}`}>{this.props.message.job_client}</NavLink></span>}</small>
                        </div>
                    </div>
                    <div className='w-10'>{statusButton}</div>
                    <div className='w-10 d-flex-end-center'>
                        {appealButton}
                        {pinnedButton}
                    </div>
                </div>

                {review}
            </React.Fragment> */}
            </div>
        );
    }
}

InquiryRow.propTypes = {
    user: PropTypes.object,
    stage: PropTypes.string,
    message: PropTypes.object,
    pin: PropTypes.func,
    pinned: PropTypes.bool
};

const mapStateToProps = state => {
    return {
        prompt: state.Prompt
    }
}

export default connect(mapStateToProps)(InquiryRow);