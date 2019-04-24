import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Username from './Username';
import { NavLink } from 'react-router-dom';
import SlideToggle from '../../utils/SlideToggle';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
import fetch from 'axios';
import { Alert } from '../../../actions/AlertActions';
import { LogError } from '../../utils/LogError';
import { connect } from 'react-redux';

class PostedJobRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            postStatus: this.props.job.job_post_status
        }
    }
    
    toggleJob() {
        this.setState({status: 'Toggling'});

        let status;

        if (this.state.postStatus === 'Active') {
            status = 'Inactive';
        } else if (this.state.postStatus === 'Inactive') {
            status = 'Active';
        }

        fetch.post('/api/posted/job/toggle', {id: this.props.job.job_post_id, status: status, user: this.props.user.user.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', postStatus: status});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/posted/job/toggle');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    render() {
        let local, remote, online;

        if (this.props.job.job_is_local) {
            local = <span className='mini-badge mini-badge-orange mr-1'>Local</span>;
        }

        if (this.props.job.job_is_remote) {
            remote = <span className='mini-badge mini-badge-green'>Remote</span>;
        }

        if (this.props.job.job_is_online) {
            online = <span className='mini-badge mini-badge-purple mr-1'>Online</span>;
        }

        return (
            <div className='job-post-row'>
                <div className='job-post-main-row'>
                    <div className='job-post-title-container'>
                        <div className='job-post-title'><NavLink to={this.props.toggable ? `/dashboard/posted/job/details/${this.props.job.job_post_id}` : `/job/${this.props.job.job_post_id}`}>{this.props.job.job_post_title}</NavLink></div>
                    </div>

                    <div className='job-post-toggler'>
                        
                    </div>
                </div>

                <div className='job-post-detail-row'>
                    <div className='job-post-detail'>{this.props.job.job_post_as_user ? <Username username={this.props.job.job_post_user} color='highlight' /> : this.props.job.job_post_company}</div>
                    <div className='job-post-detail'>{moment(this.props.job.job_post_date).format('MM-DD-YYYY')}</div>
                    <div className='job-post-detail'>{this.props.job.job_post_sector}</div>
                    <div className='job-post-detail'>{local} {online} {remote}</div>
                </div>
            </div>
        );
    }
}

PostedJobRow.propTypes = {
    job: PropTypes.object,
    user: PropTypes.object
};

export default connect()(PostedJobRow);