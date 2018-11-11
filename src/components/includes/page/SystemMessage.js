import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const SystemMessage = props => {
    let messageStatus;

    if (props.user.username === props.message.message_recipient && props.message.message_status === 'New') {
        messageStatus = <h4><span className='badge badge-success'>New</span></h4>;
    }
    
    return(
        <div className={`alert alert-${props.type} mb-3 p-2 keep-format`} role='alert'>
            <div className='d-flex-between-start'>
                <small className='text-muted'>Sent {moment(props.message.message_date).fromNow()}</small>
                {messageStatus}
            </div>

            <div className='text-center mb-3'><strong><em>{props.message.message_body}</em></strong></div>   

            <div className='text-right'><small className='text-muted'>Message ID: {props.message.message_id}</small></div> 
        </div>
    )
}

SystemMessage.propTypes = {
    message: PropTypes.object,
    type: PropTypes.string
}

export default SystemMessage;