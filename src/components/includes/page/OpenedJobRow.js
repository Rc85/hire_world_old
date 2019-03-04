import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Username from './Username';
import { NavLink } from 'react-router-dom';

class OpenedJobRow extends Component {
    render() {
        let jobStatus, jobDetails;
        
        if (this.props.job.job_status === 'New' || this.props.job.job_status === 'Viewed') {
            jobStatus = <span className='mini-badge mini-badge-warning'>Awaiting Estimate...</span>;
        } else if (this.props.job.job_status === 'Estimated') {
            if (this.props.user.user.username === this.props.job.job_user) {
                jobStatus = <span className='mini-badge mini-badge-info'>Estimate Sent</span>;
            } else {
                jobStatus = <span className='mini-badge mini-badge-info'>Estimate Received</span>;
            }
        }

        return (
            <div className='opened-job-row mb-3'>
                <NavLink to={`/dashboard/job/details/${this.props.job.job_id}`}>
                    <div className='opened-job-main-row'>
                        <div className='opened-job-title'>
                            {this.props.user.user.username === this.props.job.job_user && this.props.job.job_status === 'New' ? <span className='mini-badge mini-badge-success mr-1'>New</span> : ''}
                            <span>{this.props.job.job_title}</span>
                        </div>
    
                        <div className='opened-job-status'>{jobStatus}</div>
                    </div>
                </NavLink>

                <div className='opened-job-info-row'>
                    <div className='opened-job-info'>
                        <div className='opened-job-info-item'>Created {moment(this.props.job.job_created_date).fromNow()}</div>
    
                        <div className='opened-job-info-item'>
                            {this.props.user.user.username === this.props.job.job_user ? <Username username={this.props.job.job_client} color='highlight' /> : <Username username={this.props.job.job_user} color='highlight'W />}
                        </div>

                        {this.props.job.job_due_date ? <div className='opened-job-info-item'>Expected to be due on {moment(this.props.job.job_due_date).format('MM-DD-YYYY')}</div> : ''}
                    </div>

                    <div className='opened-job-info-item'>Job ID: {this.props.job.job_id}</div>
                </div>
            </div>
        );
    }
}

OpenedJobRow.propTypes = {

};

export default OpenedJobRow;