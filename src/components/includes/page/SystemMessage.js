import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const SystemMessage = props => {
    return(
        <div className={`alert alert-${props.type} mb-3 p-2 keep-format`} role='alert'>
            <small className='text-muted'>Sent {moment(props.message.message_date).fromNow()}</small>

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