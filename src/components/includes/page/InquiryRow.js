import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack, faGavel } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { PromptOpen, PromptReset } from '../../../actions/PromptActions';
import { connect } from 'react-redux';
import ReviewButton from '../../utils/ReviewButton';

class InquiryRow extends Component {
    componentWillReceiveProps(nextProps) {
        if (nextProps.prompt.data.action === 'appeal' && nextProps.prompt.data.id === this.props.message.job_id) {
            this.props.appeal(nextProps.prompt.input);
            this.props.dispatch(PromptReset());
        }
    }
    
    render() {
        let statusButton, pinnedButton, appealButton;

        if (this.props.message.job_status === 'New') {
            statusButton = <span className='badge badge-primary'>{this.props.message.job_status}</span>;
        }

        if (this.props.pinned) {
            pinnedButton = <button className='btn btn-warning btn-sm' onClick={() => this.props.pin()}><FontAwesomeIcon icon={faThumbtack} color='white' /></button>
        } else {
            pinnedButton = <button className='btn btn-secondary btn-sm' onClick={() => this.props.pin()}><FontAwesomeIcon icon={faThumbtack} /></button>
        }

        if (this.props.message.job_status === 'Abandoned') {
            appealButton = <button className='btn btn-primary btn-sm mr-1' onClick={() => this.props.dispatch(PromptOpen('Are there any additional information you would like to add?', {action: 'appeal', id: this.props.message.job_id}))} title='Appeal'><FontAwesomeIcon icon={faGavel} /></button>
        } else if (this.props.message.job_status === 'Completed') {
            if (this.props.message.token_status && this.props.message.token_status === 'Valid') {
                appealButton = <ReviewButton review={() => this.setState({review: true})}/>;
            } else {
                appealButton = <ReviewButton reviewed />;
            }
        }

        return (
            <div className='d-flex-between-start mb-3'>
                <div className='w-5'>{this.props.message.job_id}</div>
                <div className='w-75'>
                    <NavLink to={`/message/${this.props.stage}/${this.props.message.job_id}/details`}>{this.props.message.job_subject}</NavLink>
                    {this.props.message.unread_messages > 0 ? <span className='badge badge-danger ml-2'>{this.props.message.unread_messages}</span> : ''}

                    <div>
                        <small>{this.props.user && this.props.message.message_sender === this.props.user.username ? <span>Sent {moment(this.props.message.message_date).fromNow()} to <NavLink to={`/user/${this.props.message.message_recipient}`}>{this.props.message.message_recipient}</NavLink></span> : <span>Received {moment(this.props.message.message_date).fromNow()} from <NavLink to={`/user/${this.props.message.message_sender}`}>{this.props.message.message_sender}</NavLink></span>}</small>
                    </div>
                </div>
                <div className='w-10'>{statusButton}</div>
                <div className='w-10 d-flex-end-center'>
                    {appealButton}
                    {pinnedButton}
                </div>
            </div>
        );
    }
}

InquiryRow.propTypes = {

};

const mapStateToProps = state => {
    return {
        prompt: state.Prompt
    }
}

export default connect(mapStateToProps)(InquiryRow);