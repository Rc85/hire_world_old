import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserProfilePic from './UserProfilePic';
import moment from 'moment';
import Username from './Username';

class JobMessageRow extends Component {
    render() {
        return (
            <div className='job-message-row mb-3'>
                <div className={`${this.props.user.user && this.props.user.user.username === this.props.message.job_message_creator ? '' : 'text-right'} mb-1`}><Username username={this.props.message.job_message_creator} color='alt-highlight' /></div>

                <div className={`job-message-row-container ${this.props.user.user && this.props.user.user.username === this.props.message.job_message_creator ? 'left' : 'right'} mb-1`}>

                    <div className='job-message-row-profile-pic'><UserProfilePic url={this.props.message.avatar_url} /></div>
    
                    <div className='job-message'>
                        {this.props.user.user && this.props.user.user.username !== this.props.message.job_message_creator && this.props.message.job_message_status === 'New' ? <div className={`job-message-status ${this.props.user.user && this.props.user.user.username === this.props.message.job_message_creator ? 'right' : 'left'} mini-badge mini-badge-success`}>{this.props.message.job_message_status}</div> : ''}

                        {this.props.message.job_message}

                        <div className='text-right mt-1'><small className='text-dark'>Message ID: {this.props.message.job_message_id}</small></div>
                    </div>
                </div>

                <div className={`${this.props.user.user && this.props.user.user.username === this.props.message.job_message_creator ? 'text-right' : ''}`}><small>{this.props.user.user && this.props.user.user.username === this.props.message.job_message_creator ? 'Sent' : 'Received'} {moment(this.props.message.job_message_date).fromNow()}</small></div>
            </div>
        );
    }
}

JobMessageRow.propTypes = {

};

export default JobMessageRow;