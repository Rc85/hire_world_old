import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faComments } from '@fortawesome/free-solid-svg-icons';
import { LogError } from '../utils/LogError';
import fetch from 'axios';
import moment from 'moment';
import Username from '../includes/page/Username';
import MessageSender from '../includes/page/MessageSender';
import JobMessageRow from '../includes/page/JobMessageRow';

class JobDetails extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            sendStatus: '',
            job: {},
            messages: [],
            estimate: false
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Fetching'});

        fetch.post('/api/job/details', {id: this.props.match.params.id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', job: resp.data.job, messages: resp.data.messages});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/job/details');
            this.setState({status: ''});
        });
    }

    send(message) {
        this.setState({sendStatus: 'Sending'});

        fetch.post('/api/job/submit/message', {message: message, id: this.state.job.job_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let messages = [...this.state.messages];
                messages.unshift(resp.data.message);

                this.setState({sendStatus: '', messages: messages});
            } else if (resp.data.status === 'error') {
                this.setState({sendStatus: ''});
            }
        })
        .catch(err => {
            LogError(err, '/api/job/submit/message');
            this.setState({sendStatus: ''});
        });
    }
    
    render() {
        let jobStatus, estimator;

        if (this.state.job.job_status === 'New' || this.state.job.job_status === 'Viewed') {
            jobStatus = <span className='mini-badge mini-badge-warning ml-1'>Awaiting Estimate...</span>;
        } else if (this.state.job.job_status === 'Estimated') {
            if (this.state.job.job_user === this.props.user.user.username) {
                jobStatus = <span className='mini-badge mini-badge-info ml-1'>Estimate Sent</span>;
            } else if (this.state.job.job_client === this.props.user.user.username) {
                jobStatus = <span className='mini-badge mini-badge-info ml-1'>Estimate Received</span>;
            }
        }

        if (this.state.estimate) {
            
        }

        return (
            <section id='job-details-container' className='main-panel'>
                <TitledContainer title='Job Details' shadow bgColor='purple' icon={<FontAwesomeIcon icon={faFileAlt} />} id='job-details' minimizable minimized className='mb-5'>
                    <div className='d-flex-between-center'>
                        <div className='d-flex-center'>
                            <h2>{this.state.job.job_title}</h2>
                            {jobStatus}
                        </div>

                        <span><strong>Expected Due Date:</strong> {moment(this.state.job.job_due_date).format('MM-DD-YYYY')}</span>
                    </div>

                    <Username username={this.props.user.user.username === this.state.job.job_user ? this.state.job.job_client : this.state.job.job_user} color='alt-highlight' />
                    
                    <div className='simple-container no-bg mb-3'>
                        <div className='simple-container-title'>Job Description</div>
    
                        {this.state.job.job_description}
                    </div>

                    <div className='text-right mb-3'>
                        {this.state.job.job_user === this.props.user.user.username ?
                        <React.Fragment>
                            <button className='btn btn-info' onClick={() => this.setState({estimate: true})}>Estimate</button>
                            <button className='btn btn-danger'>Decline Job</button>
                        </React.Fragment>
                        : ''}
                    </div>

                    {estimator}

                    <div className='text-right text-dark'><small>Job ID: {this.state.job.job_id}</small></div>
                </TitledContainer>

                <TitledContainer title='Job Discussion' shadow bgColor='pink' icon={<FontAwesomeIcon icon={faComments} />}>
                    <MessageSender send={(message) => this.send(message)} status={this.state.sendStatus} />
    
                    <div id='job-messages'>
                        {this.state.messages.map((message, i) => {
                            return <JobMessageRow message={message} key={i} user={this.props.user} />
                        })}
                    </div>
                </TitledContainer>
            </section>
        );
    }
}

JobDetails.propTypes = {

};

export default withRouter(JobDetails);