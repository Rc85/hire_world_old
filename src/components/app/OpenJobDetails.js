import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Redirect } from 'react-router-dom';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faComments, faCalendarAlt, faHandHoldingUsd } from '@fortawesome/pro-solid-svg-icons';
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
import { ShowLoading, HideLoading } from '../../actions/LoadingActions';
import MoneyFormatter from '../utils/MoneyFormatter';

class OpenJobDetails extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            sendStatus: '',
            job: {},
            messages: [],
            milestones: [
                {milestone_id: Date.now(), milestone_payment_amount: 0, milestone_due_date: null, conditions: [
                    {condition_id: Date.now(), condition: null}
                ]}
            ]
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.confirm.data) {
            if (this.props.confirm.data.action === 'decline job' && this.props.confirm.option && this.props.confirm.option !== prevProps.confirm.option) {
                this.declineJob();
                this.props.dispatch(ResetConfirmation());
            } else if (this.props.confirm.data.action === 'start job' && this.props.confirm.option && this.props.confirm.option !== prevProps.confirm.option) {
                this.startJob(this.props.confirm.data.token, this.props.confirm.data.saveAddress);
                this.props.dispatch(ResetConfirmation());
            }
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Fetching'});

        fetch.post('/api/get/job/details', {id: this.props.match.params.id, stage: this.props.match.params.stage})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', job: resp.data.job, messages: resp.data.messages, milestones: resp.data.milestones.length  > 0 ? resp.data.milestones : [
                    {milestone_id: Date.now(), milestone_payment_amount: 0, milestone_due_date: null, conditions: [
                        {condition_id: Date.now(), condition: null}
                    ]}
                ]});
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

        fetch.post('/api/get/job/details', {id: this.props.match.params.id, key: this.props.match.params.acceptKey, stage: this.props.match.params.stage})
        .then(resp => {
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

                this.setState({sendStatus: 'send success', messages: messages});

                setTimeout(() => {
                    this.setState({sendStatus: ''});
                }, 5000);
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

    startJob(token, save) {
        if (this.state.job.job_status === 'Pending') {
            this.setState({status: 'Verifying'});
            this.props.dispatch(ShowLoading(`Processing`));

            fetch.post('/api/job/milestone/start', {job_id: this.state.job.job_id, job_modified_date: this.state.job.job_modified_date, id: this.state.milestones[0].milestone_id, ...token, user: this.props.user.user.username, accept: true, saveAdress: save})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: 'Job Accepted'});
                } else if (resp.data.status === 'error') {
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                    this.setState({status: ''});
                    this.refresh();
                }

                this.props.dispatch(HideLoading());
            })
            .catch(err => {
                LogError(err, '/api/job/milestone/start');
                this.setState({status: ''});
                this.props.dispatch(Alert('error', 'An error occurred'));
                this.props.dispatch(HideLoading());
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

    confirm() {
        window.scrollTo(0, 0);
        this.setState({status: 'Confirmed'});
    }

    render() {
        let jobDetails;
        
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        }

        if (this.state.status === 'error') {
            return <Redirect to='/error/app/500' />;
        } else if (this.state.status === 'Job Accepted') {
            return <Redirect to='/link_work/job/accepted' />;
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
                let details;

                if (this.state.job.job_status === 'Pending' && this.state.status !== 'Confirmed' && this.state.status !== 'Verifying') {
                    details = <MilestoneDetails
                    user={this.props.user}
                    job={this.state.job}
                    milestones={this.state.milestones}
                    decline={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to decline this job?`, `This action cannot be reverted`, {action: 'decline job'}))}
                    confirm={this.confirm.bind(this)}
                    status={this.state.status}
                    update={(job, milestones) => this.setState({job: job, milestones: milestones})}
                    />;
                } else if ((this.state.status === 'Confirmed' || this.state.status === 'Verifying') && this.props.user.user && this.props.user.user.username === this.state.job.job_client) {
                    details = <StripeProvider apiKey={process.env.REACT_ENV === 'production' ? 'pk_live_wJ7nxOazDSHu9czRrGjUqpep' : 'pk_test_KgwS8DEnH46HAFvrCaoXPY6R'}>
                        <Elements>
                            <VerifyPayment
                            user={this.props.user}
                            decline={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to decline this job?`, `This action cannot be reverted`, {action: 'decline job'}))}
                            job={this.state.job}
                            submit={(token, saveAddress) => this.props.dispatch(ShowConfirmation(`Are you sure you want to start this job?`, `An amount of $${Math.round(parseFloat(this.state.milestones[0].milestone_payment_amount) * 1.03 * 100) / 100} ($${this.state.milestones[0].milestone_payment_amount} + 3%) ${this.state.job.job_price_currency} will be charged on the selected payment method`, {action: 'start job', token: token, saveAddress: saveAddress}))}
                            back={() => this.refresh()}
                            />
                        </Elements>
                    </StripeProvider>;
                } else if (this.state.status === 'Confirmed' && this.props.user.user && this.props.user.user.username !== this.state.job.job_client) {
                    details = <h3 className='text-dark text-center'>Waiting for other party to transfer funds...</h3>;
                }

                jobDetails = <React.Fragment>
                    <div className='job-details-dates'>
                        <div className='mr-2'><FontAwesomeIcon icon={faCalendarAlt} className='text-special mr-1' /><strong>Job Created Date:</strong> {moment(this.state.job.job_created_date).format('MM-DD-YYYY')}</div>
                        {moment(this.state.job.job_due_date).isValid() ? <div className='mr-2'><strong>Expected Delivery Date:</strong> {moment(this.state.job.job_due_date).format('MM-DD-YYYY')}</div> : ''}
                        <div className='mr-2'><FontAwesomeIcon icon={faHandHoldingUsd} className='text-special mr-1' /><strong>Offered Price:</strong> {this.state.job.job_offer_price ? <span>$<MoneyFormatter value={this.state.job.job_offer_price} /> {this.state.job.job_price_currency}</span> : 'No offer price'}</div>
                        {this.state.job.job_total_price ? <div className='mr-2'><strong>Total Payment:</strong> $<MoneyFormatter value={this.state.job.job_total_price} /> {this.state.job.job_price_currency}</div> : ''}
                    </div>

                    {details}
                    
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
                        <div className='milestone-creator-buttons mb-3'>
                            <button className='btn btn-info' onClick={() => this.setState({createMilestones: true})}>Create Milestones</button>
                            <button className='btn btn-danger' onClick={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to decline this job?`, `This action cannot be reverted`, {action: 'decline job'}))}>Decline Job</button>
                        </div> : ''}

                        {this.state.createMilestones ? <MilestoneCreator job={this.state.job} milestones={this.state.milestones} update={(job, milestones) => this.setState({createMilestones: false, job: job, milestones: milestones})} /> : ''}

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