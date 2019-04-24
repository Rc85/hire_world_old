import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck, faThList, faMapMarkedAlt, faUser, faBuilding, faCalendarAlt, faTrash } from '@fortawesome/pro-solid-svg-icons';
import fetch from 'axios';
import { connect } from 'react-redux';
import { LogError } from '../utils/LogError';
import { NavLink, Redirect } from 'react-router-dom';
import moment from 'moment';
import SubmitButton from '../utils/SubmitButton';
import { Alert } from '../../actions/AlertActions';
import Username from '../includes/page/Username';
import Loading from '../utils/Loading';
import Row from '../includes/page/Row';

class AppliedJobs extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            jobs: []
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/applied/jobs')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', jobs: resp.data.jobs});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/applied/jobs');
            this.setState({status: 'error'});
        });
    }

    toggleNotification(status, id, index) {
        this.setState({status: 'Toggling Notification'});

        fetch.post('/api/posted/job/notification', {id: id, user: this.props.user.user.username, status: status})
        .then(resp => {
            if (resp.data.status === 'success') {
                let jobs = [...this.state.jobs];
                jobs[index] = {...jobs[index], ...resp.data.application};

                this.setState({status: '', jobs: jobs});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/posted/job/notification');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    removeApplication(id, index) {
        this.setState({status: 'Removing'});

        fetch.post('/api/applied/job/remove', {id: id, user: this.props.user.user.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                let jobs = [...this.state.jobs];
                jobs.splice(index, 1);

                this.setState({status: '', jobs: jobs});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/applied/job/remove');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }
    
    render() {
        if (this.state.status === 'Loading') {
            return <Loading size='7x' color='black' />;
        } else if (this.state.status === 'error') {
            return <Redirect to='/app/error/500' />;
        }

        return (
            <section id='applied-jobs' className='main-panel'>
                <TitledContainer title='Applied Jobs' bgColor='info' icon={<FontAwesomeIcon icon={faClipboardCheck} />} shadow>
                    {this.state.jobs.map((job, i) => {
                        return <Row
                        key={job.job_post_id}
                        index={i}
                        length={this.state.jobs.length}
                        title={
                            <React.Fragment>
                                {job.job_is_local ? <span className='mini-badge mini-badge-orange mr-1'>Local</span> : ''}
                                {job.job_is_online ? <span className='mini-badge mini-badge-purple mr-1'>Online</span> : ''}
                                {job.job_is_remote ? <span className='mini-badge mini-badge-green mr-1'>Remote</span> : ''}
                                <NavLink to={`/job/${job.job_post_id}`}>{job.job_post_title}</NavLink>
                            </React.Fragment>
                        }
                        details={
                            <React.Fragment>
                                {!job.job_post_as_user && job.job_post_company 
                                    ? <div className='mr-2'><small><FontAwesomeIcon icon={faBuilding} className='text-special mr-1' /> {job.job_post_company_website 
                                        ? <a href={job.job_post_company_website} rel='noopener noreferrer' target='_blank'><FontAwesomeIcon icon={faBuilding} className='text-special mr-1' /> {job.job_post_company}</a> 
                                        : job.job_post_company}</small>
                                    </div> 
                                    : <div className='mr-2'><small><FontAwesomeIcon icon={faUser} className='text-special mr-1' /> <Username username={job.job_post_user} /></small></div>
                                }
                                <div className='mr-2'><small><FontAwesomeIcon icon={faThList} className='text-special mr-1' /> {job.job_post_sector}</small></div>
                                <div className='mr-2'><small><FontAwesomeIcon icon={faCalendarAlt} className='text-special mr-1' /> Applied on {moment(job.applied_date).format('MM-DD-YYYY')}</small></div>
                            </React.Fragment>
                        }
                        />
                    })}
                </TitledContainer>
            </section>
        );
    }
}

AppliedJobs.propTypes = {

};

export default connect()(AppliedJobs);