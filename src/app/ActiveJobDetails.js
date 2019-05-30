import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Redirect } from 'react-router-dom';
import TitledContainer from '../components/utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faComments, faCommentAlt, faCalendarAlt, faUsdSquare, faCircleNotch, faCalendarTimes, faRedoAlt } from '@fortawesome/pro-solid-svg-icons';
import { LogError } from '../components/utils/LogError';
import fetch from 'axios';
import moment from 'moment';
import Username from '../components/Username';
import MessageSender from '../components/MessageSender';
import JobMessageRow from '../components/JobMessageRow';
import { ShowConfirmation, ResetConfirmation } from '../actions/ConfirmationActions';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import Loading from '../components/utils/Loading';
import { Alert } from '../actions/AlertActions';
import MilestoneTrackingRow from '../components/MilestoneTrackingRow';
import MilestoneUpdaterRow from '../components/MilestoneUpdaterRow';
import SubmitReview from '../components/SubmitReview';
import SubmitButton from '../components/utils/SubmitButton';
import MoneyFormatter from '../components/utils/MoneyFormatter';
import { UpdateUser } from '../actions/LoginActions';

class ActiveJobDetails extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            sendStatus: '',
            job: {},
            messages: [],
            milestones: [],
            createMilestones: false,
            offset: 0
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.confirm.data) {
            if (this.props.confirm.data.action === 'request close job' && this.props.confirm.option && this.props.confirm.option !== prevProps.confirm.option) {
                this.requestCloseJob()
                this.props.dispatch(ResetConfirmation());
            } else if (this.props.confirm.data.action === 'close job' && this.props.confirm.option && this.props.confirm.option !== prevProps.confirm.option) {
                this.closeJob(true)
                this.props.dispatch(ResetConfirmation());
            }
        }

        if (prevState.offset !== this.state.offset) {
            this.setState({status: 'Fetching Messages'});

            fetch.post('/api/get/job/messages', {id: this.props.match.params.id, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let messages = [...this.state.messages, ...resp.data.messages];
                    this.setState({status: '', messages: messages});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                }
            })
            .catch(err => {
                LogError(err, '/api/get/job/messages');
                this.setState({status: ''});
                this.props.dispatch(Alert('error', 'An error occurred'));
            });
        }
    }
    
    componentDidMount() {
        this.fetchJobDetails();
    }

    fetchJobDetails(timeout) {
        return fetch.post('/api/get/job/details', {id: this.props.match.params.id, stage: this.props.match.params.stage})
        .then(resp => {
            if (resp.data.status === 'success') {
                for (let milestone of resp.data.milestones) {
                    if (!milestone.conditions) {
                        milestone.conditions = [];
                    }
                }

                let status = timeout ? 'Fetched' : '';
                
                this.setState({status: status, job: resp.data.job, messages: resp.data.messages, milestones: resp.data.milestones, review: resp.data.review, totalMessages: parseInt(resp.data.totalMessages)});
                timeout && setTimeout(() => {
                    this.setState({status: ''});
                }, 3000);
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

        this.fetchJobDetails(true);
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

    changeJobStatus(status, review) {
        let job = {...this.state.job};
        job.job_status = status;

        this.setState({job: job, review: review});
    }

    submitReview(review, star) {
        this.setState({status: 'Submitting Review'});

        fetch.post('/api/authentic/review/submit', {review: review, star: star, review_id: this.state.review.review_id, job_id: this.state.job.job_id, user: this.props.user.user.username, token: this.state.review.token})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', review: resp.data.review});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/authentic/review/submit');
            this.setState({sendStatus: ''});
        });
    }

    requestCloseJob() {
        this.setState({status: 'Requesting Close'});

        fetch.post('/api/job/request/close', {user: this.props.user.user.username, job_id: this.state.job.job_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.changeJobStatus('Requesting Close');
                this.setState({status: ''});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            LogError(err, '/api/job/request/close');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    closeJob(action) {
        let status;

        if (action) {
            status = 'Approving Close Request';
        } else {
            status = 'Declining Close Request';
        }

        this.setState({status: status});

        fetch.post('/api/job/close', {user: this.props.user.user.username, job_id: this.state.job.job_id, action: action})
        .then(resp => {
            if (resp.data.status === 'success') {
                if (resp.data.closed) {
                    this.setState({status: 'Job Closed'});
                } else {
                    this.setState({status: ''});
                    this.changeJobStatus('Active');
                }
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            LogError(err, '/api/job/close');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
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

    loadMoreMessages() {
        this.setState({offset: this.state.offset + 25});
    }
    
    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        }

        if (this.state.status === 'Loading') {
            return <Loading size='7x' color='black' />;
        } else if (this.state.status === 'error') {
            return <Redirect to='/error/app/404' />;
        } else if (!this.state.job) {
            return <Redirect to='/error/job/404' />;
        } else if (this.state.status === 'Job Closed') {
            return <Redirect to='/link_work/job/closed' />;
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
                jobStatus = <span className='mini-badge mini-badge-info ml-1'>Awaiting Funds</span>;
            } else if (this.state.job.job_status === 'Active') {
                jobStatus = <span className='mini-badge mini-badge-warning ml-1'>In Progress</span>;
            } else if (this.state.job.job_status === 'Requesting Close') {
                jobStatus = <span className='mini-badge mini-badge-danger ml-1'>Requesting Close</span>;    
            } else if (this.state.job.job_status === 'Complete' || (this.state.job.job_status === 'Error' && this.state.job.job_client === this.props.user.user.username)) {
                jobStatus = <span className='mini-badge mini-badge-success ml-1'>Complete</span>;
            } else if (this.state.job.job_status === 'Abandoned') {
                jobStatus = <span className='mini-badge mini-badge-danger ml-1'>Abandoned</span>;
            } else if (this.state.job.job_status === 'Declined') {
                jobStatus = <span className='mini-badge mini-badge-danger ml-1'>Declined</span>;
            } else if (this.state.job.job_status === 'Requesting Payment') {
                jobStatus = <span className='mini-badge mini-badge-info ml-1'>Requesting Payment</span>;
            } else if (this.state.job.job_status === 'Error' && this.state.job.job_client !== this.props.user.user.username) {    
                jobStatus = <span className='mini-badge mini-badge-danger ml-1'>Error</span>;
            }

            return (
                <section id='job-details-container' className='main-panel'>
                    <TitledContainer title='Job Details' shadow bgColor='purple' icon={<FontAwesomeIcon icon={faFileAlt} />} id='job-details' minimizable className='mb-5'>
                        {this.state.status === 'Fetching' && <Loading size='5x' />}
                        <div className='job-details-header'>
                            <div className='d-flex-center'>
                                <h2>{this.state.job.job_title}</h2>
                                {jobStatus}
                            </div>

                            <button className='btn btn-primary' type='button' onClick={this.refresh.bind(this)} disabled={this.state.status === 'Fetched'}><FontAwesomeIcon icon={faRedoAlt} /></button>
                        </div>

                        <div className='job-details-subheader mb-3'>
                            <div>
                                <div className='d-flex mb-2'>
                                    <div className='mr-2'><Username username={this.props.user.user && this.props.user.user.username === this.state.job.job_user ? this.state.job.job_client : this.state.job.job_user} color='alt-highlight' /></div>
                                    {moment(this.state.job.job_due_date).isValid() ? <div className='mr-2'><strong>Expected on:</strong> {moment(this.state.job.job_due_date).format('MM-DD-YYYY')}</div> : ''}
                                </div>
                                
                                <div className='d-flex'>
                                    <div className='mr-2'><FontAwesomeIcon icon={faCalendarAlt} className='text-special mr-1' /><strong>Created on:</strong> {moment(this.state.job.job_created_date).format('MM-DD-YYYY')}</div>
                                    <div className='mr-2'><FontAwesomeIcon icon={faUsdSquare} className='text-special mr-1' /><strong>Total Payment:</strong> $<MoneyFormatter value={this.state.job.job_total_price} /> {this.state.job.job_price_currency.toUpperCase()}</div>
                                    {this.state.job.job_due_date ? <div className='mr-2'><FontAwesomeIcon icon={faCalendarTimes} className='text-special mr-1' /><strong>Expected Delivery Date:</strong> {moment(this.state.job.job_due_date).format('MM-DD-YYYY')}</div> : ''}
                                </div>
                            </div>

                            <div className='text-right'>
                                {this.props.user.user && this.props.user.user.username === this.state.job.job_user && this.state.job.job_status !== 'Requesting Close' ? <SubmitButton type='button' loading={this.state.status === 'Requesting Close'} value={<nobr>Close Job</nobr>} bgColor='danger' onClick={() => this.props.dispatch(ShowConfirmation(`This will send a request to the other party to close the job. Proceed?`, false, {action: 'request close job'}))} /> : ''}
                            </div>
                        </div>

                        {this.state.job.job_status === 'Requesting Close' && this.props.user.user && this.props.user.user.username === this.state.job.job_client ? <div className='simple-container no-bg mb-3'>
                            <div className='simple-container-title'>Confirmation</div>

                            <div className='mb-3'>The other party has requested to close this job. Refer to <NavLink to='/faq'>FAQ</NavLink> for more details on closing a job.</div>

                            <div className='text-right'>
                                <SubmitButton type='button' loading={this.state.status === 'Approving Close Request'} value={'Approve'} onClick={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to approve this request?`, false, {action: 'close job', id: this.state.job.job_id}))} bgColor='success' />
                                <SubmitButton type='button' loading={this.state.status === 'Declining Close Request'} value={'Decline'} onClick={() => this.closeJob(false)} bgColor='danger' />
                            </div>
                        </div> : ''}

                        <div className='text-right mb-3'><label><input type='checkbox' onChange={() => this.saveSetting('hide_completed_milestones')} checked={this.props.user.user.hide_completed_milestones} /> Hide completed milestones</label></div>

                        <hr/>

                        {this.props.user.user && this.props.user.user.username === this.state.job.job_client ? <div id='milestone-tracker'>
                            {this.state.milestones.map((milestone, i) => {
                                if (this.props.user.user && this.props.user.user.hide_completed_milestones && milestone.milestone_status === 'Complete') {
                                    return null;
                                }

                                return <MilestoneTrackingRow key={Date.now() + i} job={this.state.job} milestone={milestone} index={i + 1} user={this.props.user} changeJobStatus={(status, review) => this.changeJobStatus(status, review)} />
                            })}
                        </div> : ''}

                        {this.props.user.user && this.props.user.user.username === this.state.job.job_user ? <div id='milestone-updater'>
                            {this.state.milestones.map((milestone, i) => {
                                if (this.props.user.user && this.props.user.user.hide_completed_milestones && milestone.milestone_status === 'Complete') {
                                    return null;
                                }
                                
                                return <MilestoneUpdaterRow key={Date.now() + i} job={this.state.job} milestone={milestone} index={i + 1} changeJobStatus={(status) => this.changeJobStatus(status)} user={this.props.user} enableJobClose={() => this.setState({closeJob: true})} />;
                            })}
                        </div> : ''}

                        <div className='text-right text-dark'><small>Job ID: {this.state.job.job_id}</small></div>
                    </TitledContainer>

                    {this.props.user.user && this.state.job.job_client === this.props.user.user.username && this.state.review && this.state.review.token_status === 'Valid' ? <TitledContainer title='Submit Review' bgColor='green' shadow className='mb-5' icon={<FontAwesomeIcon icon={faCommentAlt} />}><SubmitReview review={this.state.review} user={this.props.user} submit={(review, star) => this.submitReview(review, star)} status={this.state.status} stars={this.state.review.review_rating} /></TitledContainer> : ''}

                    {this.state.job.job_status !== 'Complete' && this.state.job.job_status !== 'Abandoned' ? <TitledContainer title='Job Discussion' shadow bgColor='pink' icon={<FontAwesomeIcon icon={faComments} />}>
                        <MessageSender send={(message) => this.send(message)} status={this.state.sendStatus} />

                        <div id='job-messages'>
                            {this.state.messages.map((message, i) => {
                                if (message.job_message_type === 'User') {
                                    return <JobMessageRow message={message} key={message.job_message_id} user={this.props.user} />
                                } else if (message.job_message_type === 'System') {
                                    return <div key={message.job_message_id} className='text-center mb-3'>
                                        <em>{message.job_message_status === 'New' ? <span className='mini-badge mini-badge-primary'>New</span> : ''} {message.job_message} - {moment(message.job_message_date).fromNow()}</em>
                                    </div>
                                }
                            })}

                            {this.state.status === 'Fetching Messages' && <div className='text-center'><FontAwesomeIcon icon={faCircleNotch} size='5x' spin /></div>}

                            {this.state.totalMessages > 25 && this.state.messages.length < this.state.totalMessages ? <div className='text-center'><button className='btn btn-primary' onClick={this.loadMoreMessages.bind(this)}>Load more</button></div> : ''}
                        </div>
                    </TitledContainer> : ''}
                </section>
            );
        }

        return <Loading size='7x' color='black' />;
    }
}

ActiveJobDetails.propTypes = {

};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(withRouter(ActiveJobDetails));