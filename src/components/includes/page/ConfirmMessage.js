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
        let declineMessageInput;
        let alertClass = this.props.type;

        let buttons = <div className='mb-3'>
            <button className='btn btn-success mr-1' onClick={() => this.props.approve()}>Approve</button>
            <button className='btn btn-danger' onClick={() => {
                if (this.props.prompt) {
                    this.setState({decline: true});
                } else {
                    this.props.decline(this.state.declineMessage);
                }
            }}>Decline</button>
        </div>;

        if (this.props.job.job_user_complete === false && this.props.job.job_client_complete === false) {
            buttons = <div className='text-center'><strong><em>You declined the request.</em></strong></div>;
            alertClass = 'warning';
        } else if (this.props.job.job_user_complete && this.props.job.job_client_complete) {
            buttons = <div className='text-center'><strong><em>You approved the request.</em></strong></div>;
            alertClass = 'success';
        }

        if (this.state.decline) {
            declineMessageInput = <div className='mb-3'>
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
                <small className='text-muted'>Sent {moment(this.props.message.message_date).from()} {this.props.message.message_modified_date ? <span>(Resent {moment(this.props.message.message_modified_date).fromNow()})</span> : ''}</small>

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