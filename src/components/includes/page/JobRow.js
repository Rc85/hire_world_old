import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Username from './Username';
import { NavLink } from 'react-router-dom';

class JobRow extends Component {
    render() {
        let jobStatus, review;
        
        if (this.props.job.job_status === 'New' || this.props.job.job_status === 'Open') {
            jobStatus = <span className='mini-badge mini-badge-warning'>Awaiting Response...</span>;
        } else if (this.props.job.job_status === 'Pending') {
            if (this.props.user.user && this.props.user.user.username === this.props.job.job_user) {
                jobStatus = <span className='mini-badge mini-badge-info'>Details Sent</span>;
            } else {
                jobStatus = <span className='mini-badge mini-badge-info'>Details Received</span>;
            }
        } else if (this.props.job.job_status === 'Confirmed') {
            jobStatus = <span className='mini-badge mini-badge-info'>Awaiting Funds...</span>;
        } else if (this.props.job.job_status === 'Active') {
            jobStatus = <span className='mini-badge mini-badge-warning'>In Progress</span>;
        } else if (this.props.job.job_status === 'Requesting Close') {
            jobStatus = <span className='mini-badge mini-badge-danger'>Requesting Close...</span>;
        } else if (this.props.job.job_status === 'Complete') {
            jobStatus = <span className='mini-badge mini-badge-success'>Complete</span>;
        } else if (this.props.job.job_status === 'Abandoned') {
            jobStatus = <span className='mini-badge mini-badge-danger'>Abandoned</span>;
        } else if (this.props.job.job_status === 'Declined') {
            jobStatus = <span className='mini-badge mini-badge-danger'>Declined</span>;
        } else if (this.props.job.job_status === 'Requesting Payment') {
            jobStatus = <span className='mini-badge mini-badge-info'>Requesting Payment...</span>;
        }

        if (this.props.job.token_status === 'Valid') {
            review = <span className='mini-badge mini-badge-warning mr-1'>Pending Review</span>
        }

        return (
            <div className='job-row mb-3'>
                <NavLink to={`/dashboard/job/details/${this.props.stage}/${this.props.job.job_id}`}>
                    <div className='job-main-row'>
                        <div className='job-title'>
                            {this.props.user.user && this.props.user.user.username === this.props.job.job_user && this.props.job.job_status === 'New' ? <span className='mini-badge mini-badge-success mr-1'>New</span> : ''}
                            <span>{this.props.job.job_title}</span>
                            {this.props.job.new_message ? <div className='mini-badge mini-badge-danger ml-1'>{this.props.job.new_message}</div> : ''}
                        </div>
    
                        <div className='job-status'>{review} {jobStatus}</div>
                    </div>
                </NavLink>

                <div className='job-info-row'>
                    <div className='job-info'>
                        <div className='job-info-item'>Created {moment(this.props.job.job_created_date).fromNow()}</div>
    
                        <div className='job-info-item'>
                            {this.props.user.user && this.props.user.user.username === this.props.job.job_user ? <Username username={this.props.job.job_client} color='highlight' /> : <Username username={this.props.job.job_user} color='highlight'W />}
                        </div>

                        {this.props.job.job_due_date ? <div className='job-info-item'>Expected delivery on {moment(this.props.job.job_due_date).format('MM-DD-YYYY')}</div> : ''}
                    </div>

                    <div className='job-info-item'>Job ID: {this.props.job.job_id}</div>
                </div>
            </div>
        );
    }
}

JobRow.propTypes = {
    job: PropTypes.object,
    user: PropTypes.object
};

export default JobRow;