import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../components/utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileSpreadsheet, faCalendarExclamation, faUserCircle, faCalendarAlt } from '@fortawesome/pro-solid-svg-icons';
import fetch from 'axios';
import { LogError } from '../components/utils/LogError';
import { Redirect, withRouter, NavLink } from 'react-router-dom';
import Loading from '../components/utils/Loading';
import Pagination from '../components/utils/Pagination';
import { UpdateUser } from '../actions/LoginActions';
import { connect } from 'react-redux';
import Username from '../components/Username';
import Row from '../components/Row';
import moment from 'moment';

class Jobs extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            jobs: [],
            offset: 0,
            totalJobs: 0
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.key !== this.props.location.key || prevState.offset !== this.state.offset) {
            this.setState({status: 'Fetching'});

            fetch.post('/api/jobs/fetch', {stage: this.props.match.params.stage, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', jobs: resp.data.jobs});
                } else if (resp.data.status === 'error') {
                    this.setState({status: 'error'});
                }
            })
            .catch(err => {
                LogError(err, '/api/jobs/fetch');
                this.setState({status: ''});
            });
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Fetching'});
        
        fetch.post('/api/jobs/fetch', {stage: this.props.match.params.stage, offset: this.state.offset})
        .then(resp => {
            console.log(resp);
            if (resp.data.status === 'success') {
                this.setState({status: '', jobs: resp.data.jobs, totalJobs: resp.data.totalJobs});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/jobs/fetch');
            this.setState({status: ''});
        });
    }

    selectPage() {
        this.setState({offset: this.state.offset + 25})
    }

    saveSetting(name) {
        this.setState({status: name});

        let setting = Object.assign({}, this.props.user.user);
        setting[name] = !setting[name];

       fetch.post(`/api/user/settings/change`, setting)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(UpdateUser(setting));
            } else {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }

            this.setState({status: ''});
        })
        .catch(err => {
            LogError(err, '/api/user/settings/change');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }
    
    render() {    
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        }
        
        if (this.props.user.user) {
            let jobs = this.state.jobs.map((job, i) => {
                if (this.props.user.user && this.props.user.user.hide_declined_jobs && job.job_status === 'Declined') {
                    return null;
                }
                
                let jobStatus, review;
        
                if (job.job_status === 'New' || job.job_status === 'Open') {
                    jobStatus = <span className='mini-badge mini-badge-warning'>Awaiting Response</span>;
                } else if (job.job_status === 'Pending') {
                    if (this.props.user.user && this.props.user.user.username === job.job_user) {
                        jobStatus = <span className='mini-badge mini-badge-info'>Details Sent</span>;
                    } else {
                        jobStatus = <span className='mini-badge mini-badge-info'>Details Received</span>;
                    }
                } else if (job.job_status === 'Confirmed') {
                    jobStatus = <span className='mini-badge mini-badge-info'>Awaiting Funds</span>;
                } else if (job.job_status === 'Active') {
                    jobStatus = <span className='mini-badge mini-badge-warning'>In Progress</span>;
                } else if (job.job_status === 'Requesting Close') {
                    jobStatus = <span className='mini-badge mini-badge-danger'>Requesting Close...</span>;
                } else if (job.job_status === 'Complete' || (job.job_status === 'Error' && this.props.user.user && this.props.user.user.username === job.job_client)) {
                    jobStatus = <span className='mini-badge mini-badge-success'>Complete</span>;
                } else if (job.job_status === 'Abandoned') {
                    jobStatus = <span className='mini-badge mini-badge-danger'>Abandoned</span>;
                } else if (job.job_status === 'Declined') {
                    jobStatus = <span className='mini-badge mini-badge-danger'>Declined</span>;
                } else if (job.job_status === 'Requesting Payment') {
                    jobStatus = <span className='mini-badge mini-badge-info'>Requesting Payment</span>;
                } else if (job.job_status === 'Error' && this.props.user.user && this.props.user.user.username !== job.job_client) {
                    jobStatus = <span className='mini-badge mini-badge-danger'>Error</span>;
                }

                if (job.token_status === 'Valid') {
                    review = <span className='mini-badge mini-badge-warning mr-1'>Pending Review</span>
                }

                return <Row
                key={job.job_id}
                index={i}
                title={
                    <React.Fragment>
                        {this.props.user.user && this.props.user.user.username === job.job_user && job.job_status === 'New' ? <span className='mini-badge mini-badge-primary mr-1'>New</span> : ''}
                        {job.new_message && parseInt(job.new_message) > 0 ? <span className='mr-2 mini-badge mini-badge-success'>{job.new_message}</span> : ''} 
                        <NavLink to={`/dashboard/job/details/${this.props.match.params.stage}/${job.job_id}`}>{job.job_title}</NavLink>
                    </React.Fragment>
                }
                details={
                    <React.Fragment>
                        <div className='row-detail'>Job ID: {job.job_id}</div>
                        <div className='row-detail'><FontAwesomeIcon icon={faUserCircle} className='text-special mr-1' /> {this.props.user.user && this.props.user.user.username === job.job_user ? <Username username={job.job_client} color='alt-highlight' /> : <Username username={job.job_user} color='alt-highlight' />}</div>
                        <div className='row-detail'><FontAwesomeIcon icon={faCalendarAlt} className='text-special mr-1' /> Created {moment(job.job_created_date).fromNow()}</div>
                        {job.job_due_date ? <div className='row-detail'><FontAwesomeIcon icon={faCalendarExclamation} className='text-special mr-1' /> Expected delivery on {moment(job.job_due_date).format('MM-DD-YYYY')}</div> : ''}
                    </React.Fragment>
                }
                buttons={
                    <div className='job-status'>{review} {jobStatus}</div>
                }
                />
            });

            return (
                <section id='opened-jobs' className='main-panel'>
                    <TitledContainer title='Jobs' icon={<FontAwesomeIcon icon={faFileSpreadsheet} />} shadow bgColor='green'>
                        {this.state.status === 'error' ? <span>An error occurred while retrieving the job list</span> : ''}

                        <div className='text-right mb-3'><label><input type='checkbox' onChange={() => this.saveSetting('hide_declined_jobs')} checked={this.props.user.user.hide_declined_jobs} /> Hide declined jobs</label></div>

                        <div className='mb-3'><Pagination totalItems={parseInt(this.state.totalJobs)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} /></div>

                        {jobs}

                        <div className='mt-3'><Pagination totalItems={parseInt(this.state.totalJobs)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} /></div>
                    </TitledContainer>
                </section>
            );
        }

        return <Loading size='7x' color='black' />;
    }
}

Jobs.propTypes = {

};

export default withRouter(connect()(Jobs));