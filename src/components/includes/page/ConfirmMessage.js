import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

class ConfirmMessage extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            decline: false,
            declineMessage: ''
        }
    }
    
    render() {
        let declineMessageInput, messageStatus;
        let alertClass = this.props.type;

        let buttons = <div className='mb-3'>
            <button id='confirm-message-approve-button' className='btn btn-success mr-1' onClick={() => this.props.approve()}>Approve</button>
            <button id='confirm-message-decline-button' className='btn btn-danger' onClick={() => {
                if (this.props.prompt) {
                    this.setState({decline: true});
                } else {
                    this.props.decline(this.state.declineMessage);
                }
            }}>Decline</button>
        </div>;

        if (this.props.user.username === this.props.message.message_recipient && this.props.message.message_status === 'New') {
            messageStatus = <h4><span className='badge badge-success'>New</span></h4>;
        }

        if (this.props.job.job_user_complete === false && this.props.job.job_client_complete === false) {
            buttons = <div id='confirm-message-declined-message' className='text-center'><strong><em>You declined the request.</em></strong></div>;
            alertClass = 'warning';
        } else if (this.props.job.job_user_complete && this.props.job.job_client_complete) {
            buttons = <div id='confirm-message-approved-message' className='text-center'><strong><em>You approved the request.</em></strong></div>;
            alertClass = 'success';
        }

        if (this.state.decline) {
            declineMessageInput = <div id='confirm-message-reason-input' className='mb-3'>
                <textarea rows='3' className='form-control w-100 mb-1' onChange={(e) => this.setState({declineMessage: e.target.value})} placeholder={`Briefly describe the reason why you are declining the other party's request.`}></textarea>
                <div className='text-right'>
                    <button className='btn btn-primary mr-1' onClick={() => {
                        this.props.decline(this.state.declineMessage)
                        this.setState({decline: false});
                    }}>Submit</button>
                    <button className='btn btn-secondary' onClick={() => this.setState({decline: false})}>Cancel</button>
                </div>
            </div>
        }

        return(
            <div className={`alert alert-${alertClass} mb-3 p-2`} role='alert'>
                <div className='d-flex-between-center'>
                    <small className='text-muted'>Sent {moment(this.props.message.message_date).from()} {this.props.message.message_modified_date ? <span>(Resent {moment(this.props.message.message_modified_date).fromNow()})</span> : ''}</small>
                    {messageStatus}
                </div>

                <div className='text-center mb-3 keep-format'><strong>{this.props.message.message_body}</strong></div>

                <hr/>

                {buttons}

                {declineMessageInput}

                <div className='text-right'><small className='text-muted'>Message ID: {this.props.message.message_id}</small></div>
            </div>
        )
    }
}

ConfirmMessage.propTypes = {
    message: PropTypes.object,
    job: PropTypes.object,
    type: PropTypes.string,
    approve: PropTypes.func,
    decline: PropTypes.func,
    message: PropTypes.object
};

export default ConfirmMessage;