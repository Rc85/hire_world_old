import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Redirect } from 'react-router-dom';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faComments } from '@fortawesome/free-solid-svg-icons';
import { LogError } from '../utils/LogError';
import fetch from 'axios';
import moment from 'moment';
import Username from '../includes/page/Username';
import MessageSender from '../includes/page/MessageSender';
import JobMessageRow from '../includes/page/JobMessageRow';
import MilestoneCreator from '../includes/page/MilestoneCreator';
import { ShowConfirmation, ResetConfirmation, HideConfirmation } from '../../actions/ConfirmationActions';
import { connect } from 'react-redux';
import MilestoneDetails from '../includes/page/MilestoneDetails';
import { NavLink } from 'react-router-dom';
import Loading from '../utils/Loading';
import { Alert } from '../../actions/AlertActions';
import VerifyPayment from '../includes/page/VerifyPayment';
import { StripeProvider, Elements } from 'react-stripe-elements';
import JobProposal from '../includes/page/JobProposal';

class OpenJobDetails extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            sendStatus: '',
            job: {},
            messages: [],
            milestones: []
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.confirm.data) {
            if (this.props.confirm.data.action === 'decline job' && this.props.confirm.option && this.props.confirm.option !== prevProps.confirm.option) {
                this.declineJob();
                this.props.dispatch(ResetConfirmation());
            } else if (this.props.confirm.data.action === 'start job' && this.props.confirm.option && this.props.confirm.option !== prevProps.confirm.option) {
                this.startJob(this.props.confirm.data.token);
                this.props.dispatch(ResetConfirmation());
            }
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Fetching'});

        fetch.post('/api/get/job/details', {id: this.props.match.params.id, stage: this.props.match.params.stage})
        .then(resp => {
            console.log(resp);
            if (resp.data.status === 'success') {
                this.setState({status: '', job: resp.data.job, messages: resp.data.messages, milestones: resp.data.milestones});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/job/details');
            this.setState({status: ''});
        });
    }

    refresh() {
        this.setState({status: 'Fetching'});

        fetch.post('/api/get/job/details', {id: this.props.match.params.id, key: this.props.match.params.acceptKey})
        .then(resp => {
            console.log(resp);
            if (resp.data.status === 'success') {
                this.setState({status: '', job: resp.data.job, messages: resp.data.messages, milestones: resp.data.milestones});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/job/details');
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

    declineJob() {
        this.setState({status: 'Declining'});

        fetch.post('/api/job/decline', {id: this.state.job.job_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let job = {...this.state.job};
                job.job_status = 'Declined';
                this.setState({status: '', job: job});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            LogError(err, '/api/job/decline');
            this.setState({status: ''});
            this.props.disatpch('error', 'An error occurred');
        });
    }

    hideConfirmation() {
        this.props.dispatch(HideConfirmation(false));
        document.body.style.overflowY = 'auto';
    }

    startJob(token) {
        if (this.state.job.job_status === 'Pending') {
            this.setState({status: 'Verifying'});

            fetch.post('/api/job/accept', {job: this.state.job, ...token, user: this.props.user.user.username})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: 'Job Accepted'});
                } else if (resp.data.status === 'error') {
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                    this.setState({status: ''});
                }
            })
            .catch(err => {
                LogError(err, '/api/job/accept');
                this.setState({status: ''});
                this.props.dispatch(Alert('error', 'An error occurred'));
            });
        } else {
            this.props.dispatch(Alert('error', 'Cannot start job'));
        }
    }

    editProposal(data) {
        this.setState({status: 'Submitting Proposal'});

        fetch.post('/api/job/create', {...data, job_id: this.state.job.job_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', edit: false, job: resp.data.job});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }
            
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/job/create');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    render() {
        let jobDetails;
        
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/' />;
        }

        if (this.state.status === 'error') {
            return <Redirect to='/error/app/500' />;
        } else if (this.state.status === 'Job Accepted') {
            return <Redirect to='/job/accepted' />;
        } else if (!this.state.job) {
            return <Redirect to='/error/job/404' />;
        }

        if (this.props.user.user) {
            let jobStatus;

            if (this.state.job.job_status === 'New' || this.state.job.job_status === 'Open') {
                jobStatus = <span className='mini-badge mini-badge-warning ml-1'>Awaiting Response...</span>;
            } else if (this.state.job.job_status === 'Pending') {
                if (this.props.user.user && this.state.job.job_user === this.props.user.user.username) {
                    jobStatus = <span className='mini-badge mini-badge-info ml-1'>Details Sent</span>;
                } else if (this.props.user.user && this.state.job.job_client === this.props.user.user.username) {
                    jobStatus = <span className='mini-badge mini-badge-info ml-1'>Details Received</span>;
                }
            } else if (this.state.job.job_status === 'Confirmed') {
                jobStatus = <span className='mini-badge mini-badge-info ml-1'>Awaiting Funds...</span>;
            } else if (this.state.job.job_status === 'Active') {
                jobStatus = <span className='mini-badge mini-badge-warning ml-1'>In Progress</span>;
            } else if (this.state.job.job_status === 'Completed') {
                jobStatus = <span className='mini-badge mini-badge-success ml-1'>Completed</span>;
            } else if (this.state.job.job_status === 'Abandoned') {
                jobStatus = <span className='mini-badge mini-badge-danger ml-1'>Abandoned</span>;
            } else if (this.state.job.job_status === 'Declined') {
                jobStatus = <span className='mini-badge mini-badge-danger ml-1'>Declined</span>;
            }

            if (this.state.edit) {
                jobDetails = <JobProposal cancel={() => this.setState({edit: false})} submit={(data) => this.editProposal(data)} status={this.state.status} job={this.state.job} />;
            } else {
                jobDetails = <React.Fragment>
                    <div className='job-details-dates'>
                        <div className='mr-2'><strong>Job Created Date:</strong> {moment(this.state.job.job_created_date).format('MM-DD-YYYY')}</div>
                        <div className='mr-2'><strong>Expected Delivery Date:</strong> {moment(this.state.job.job_due_date).format('MM-DD-YYYY')}</div>
                        <div className='mr-2'><strong>Offered Price:</strong> {this.state.job.job_offer_price ? `$${this.state.job.job_offer_price} ${this.state.job.job_price_currency}` : 'No offer price'}</div>
                    </div>

                    {this.state.job.job_status === 'Pending' && this.state.status !== 'Confirmed' ? 
                    <MilestoneDetails user={this.props.user} job={this.state.job} milestones={this.state.milestones} decline={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to decline this job?`, `This action cannot be reverted`, {action: 'decline job'}))} confirm={() => this.setState({status: 'Confirmed'})} status={this.state.status} />
                    : ''}

                    {this.state.status === 'Confirmed' ? this.props.user.user && this.props.user.user.username === this.state.job.job_client ? <StripeProvider apiKey={process.env.REACT_ENV === 'production' ? 'pk_live_wJ7nxOazDSHu9czRrGjUqpep' : 'pk_test_KgwS8DEnH46HAFvrCaoXPY6R'}><Elements><VerifyPayment user={this.props.user} decline={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to decline this job?`, `This action cannot be reverted`, {action: 'decline job'}))} job={this.state.job} submit={(token) => this.props.dispatch(ShowConfirmation(`Are you sure you want to start this job?`, `An amount of $${Math.round(parseFloat(this.state.milestones[0].milestone_payment_amount) * 1.05 * 100) / 100} ($${this.state.milestones[0].milestone_payment_amount} + 5%) ${this.state.job.job_price_currency} will be charged on the selected payment method`, {action: 'start job', token: token}))} back={() => this.refresh()} /></Elements></StripeProvider> : <h3 className='text-dark text-center'>Waiting for other party to transfer funds...</h3> : ''}
                    
                    <div className='simple-container no-bg mb-3'>
                        <div className='simple-container-title'>Job Description</div>

                        {this.state.job.job_description}
                    </div>
                </React.Fragment>;
            }
            
            return (
                <section id='job-details-container' className='main-panel'>
                    <TitledContainer title='Job Details' shadow bgColor='purple' icon={<FontAwesomeIcon icon={faFileAlt} />} id='job-details' minimizable className='mb-5'>
                        <div className='job-details-header'>
                            <div className='d-flex-center'>
                                <h2>{this.state.job.job_title}</h2>
                                {jobStatus}
                            </div>
                        </div>

                        <div className='job-details-subheader'>
                            <Username username={this.props.user.user && this.props.user.user.username === this.state.job.job_user ? this.state.job.job_client : this.state.job.job_user} color='alt-highlight' />
                            {this.props.user.user && this.props.user.user.username === this.state.job.job_client ? <button className='btn btn-info' onClick={() => this.setState({edit: true})}>Edit</button> : ''}
                        </div>

                        {jobDetails}

                        {this.props.user.user && this.state.job.job_user === this.props.user.user.username && (this.state.job.job_status === 'Open' || this.state.job.job_status === 'New') ? 
                        <div className='text-right mb-3'>
                            <button className='btn btn-info' onClick={() => this.setState({createMilestones: true})}>Create Milestones</button>
                            <button className='btn btn-danger' onClick={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to decline this job?`, `This action cannot be reverted`, {action: 'decline job'}))}>Decline Job</button>
                        </div> : ''}

                        {this.state.createMilestones ? <MilestoneCreator jobId={this.state.job.job_id} jobModifiedDate={this.state.job.job_modified_date} /> : ''}

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

        return <Loading size='7x' color='black' />;
    }
}

OpenJobDetails.propTypes = {

};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(withRouter(OpenJobDetails));