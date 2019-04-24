import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/pro-solid-svg-icons';

class AdminErrorRow extends Component {
    render() {
        return (
            <div className='d-flex-center mb-3'>
                <div className='w-5'>{this.props.error.error_id}</div>
                <div className='w-10'>{this.props.error.error_name}</div>
                <div className='w-40'>{this.props.error.error_message}</div>
                <div className='w-25'>{this.props.error.error_url}</div>
                <div className='w-10'>{this.props.error.error_origin}</div>
                <div className='w-5'>{this.props.error.error_occurrence}</div>
                <div className='w-5 text-right'><button className='btn btn-primary btn-sm' title='fixed'><FontAwesomeIcon icon={faCheck} /></button></div>
            </div>
        );
    }
}

AdminErrorRow.propTypes = {
    error: PropTypes.object.isRequired
};

export default AdminErrorRow;