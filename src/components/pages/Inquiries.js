import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LogError } from '../utils/LogError';
import { connect } from 'react-redux';
import fetch from 'axios';
import Pagination from '../utils/Pagination';
import MessageRow from '../includes/page/MessageRow';
import Loading from '../utils/Loading';
import InquiryRow from '../includes/page/InquiryRow';
import { withRouter, Redirect } from 'react-router-dom';
import MessageDetails from '../pages/MessageDetails';
import Response from '../pages/Response';
import { GetUserNotificationAndMessageCount } from '../../actions/FetchActions';
import { Alert } from '../../actions/AlertActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faDotCircle, faCheckCircle, faBan, faTimes, faList, faBars, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

class Inquiries extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            statusMessage: '',
            offset: 0,
            showing: 'all',
            messages: [],
            pinnedMessages: [],
            idToLoad: null,
            loadedJob: {},
            showMessageList: true
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevState.showing !== this.state.showing || prevState.offset !== this.state.offset || prevProps.location.key !== this.props.location.key) {
            let idToLoad = this.state.idToLoad;
            let loadedJob = {...this.state.loadedJob};

            if (prevProps.location.key !== this.props.location.key) {
                idToLoad = null;
                loadedJob = {};
            }
            
            this.setState({status: 'Loading', idToLoad: idToLoad, loadedJob, loadedJob});

            fetch.post(`/api/get/messages/${this.state.showing}`, {stage: this.props.match.params.stage, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    // Get the total number of messages so we determine how many pages there are in Pagination component
                    let messageCount = 0;

                    if (resp.data.messages.length > 0) {
                        messageCount = resp.data.messageCount;
                    }

                    this.setState({messages: resp.data.messages, status: '', messageCount: messageCount, pinnedMessages: resp.data.pinned, showMessageList: true});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});

                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                } else if (resp.data.status === 'suspended') {
                    this.setState({status: 'suspended'});
                } else if (resp.data.status === 'access error') {
                    this.setState({status: resp.data.status});
                }
            })
            .catch(err => LogError(err, `/api/get/messages/${this.state.showing}`));
        }
    }
    
    componentDidMount() {
        fetch.post(`/api/get/messages/${this.state.showing}`, {stage: this.props.match.params.stage, offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                // Get the total number of messages so we determine how many pages there are in Pagination component
                let messageCount = 0;

                if (resp.data.messages.length > 0) {
                    messageCount = resp.data.messageCount;
                }

                this.setState({messages: resp.data.messages, status: '', messageCount: messageCount, pinnedMessages: resp.data.pinned});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            } else if (resp.data.status === 'suspended') {
                this.setState({status: 'suspended'});
            } else if (resp.data.status === 'access error') {
                this.setState({status: resp.data.status});
            }
        })
        .catch(err => LogError(err, `/api/get/messages/${this.state.showing}`));
    }

    pinMessage(id) {
        this.setState({status: 'Loading'});

        fetch.post('/api/job/pin', {id: id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let pinned = this.state.pinnedMessages;

                if (resp.data.action === 'pin') {
                    pinned.push(id);
                } else if (resp.data.action === 'delete') {
                    pinned.splice(pinned.indexOf(id), 1);
                }

                this.setState({status: '', pinnedMessages: pinned});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/job/pin'));
    }

    loadMessage(id, index) {
        this.setState({status: 'Loading Message', idToLoad: id, showMessageList: false});

        fetch.post('/api/get/offer', {job_id: id, stage: this.props.match.params.stage})
        .then(offerResponse => {
            if (offerResponse.data.status === 'success') {
                fetch.post('/api/get/message', {job_id: id, offset: 0, stage: this.props.match.params.stage})
                .then(resp => {
                    if (resp.data.status === 'success') {
                        let messages = [...this.state.messages];
                        messages[index] = resp.data.job;

                        let loadedJob = {};
                        loadedJob['job'] = offerResponse.data.job;
                        loadedJob['messages'] = resp.data.messages;
                        loadedJob['offer'] = offerResponse.data.offer;

                        this.props.dispatch(GetUserNotificationAndMessageCount());

                        this.setState({status: '', messages: messages, idToLoad: null, loadedJob: loadedJob, jobIndex: index});
                    } else if (resp.status === 'access error') {
                        this.setState({status: ''});
                        this.props.dispatch(Alert(resp.data.status, ''))
                    }
                })
                .catch(err => LogError(err, '/api/get/message'));
            } else if (resp.data.status === 'access error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage})
            }
        })
        .catch(err => LogError(err, '/api/get/offer'));
    }

    removeJob(decision) {
        let message;

        if (decision === 'offer accepted') {
            message = 'Active Job created';
        } else if (decision === 'job complete') {
            message = 'Job moved to Completed';
        } else if (decision === 'job close') {
            message = 'Inquiry closed';
        } else if (decision === 'approve abandon') {
            message = 'Job was incomplete';
        } else if (decision === 'decline abandon') {
            message = 'Job moved to Abandoned';
        }

        let messages = [...this.state.messages];
        messages.splice(this.state.jobIndex, 1);

        this.setState({messages: messages, idToLoad: null, loadedJob: {}});
        this.props.dispatch(Alert('success', message));
    }

    submit(review, message, star, index) {
        this.setState({status: 'Loading'});

        fetch.post('/api/user/review/submit', {review: review, message, star: star})
        .then(resp => {
            let messages = [...this.state.messages];
            messages[index] = resp.data.job;

            this.setState({status: '', messages: messages});
            
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/user/review/submit'));
    }

    appealAbandon(val) {
        this.setState({status: 'Loading'});

        fetch.post('/api/jobs/appeal-abandon', {job_id: this.props.message.job_id, additional_info: val})
        .then(resp => {
            this.setState({status: ''});

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/jobs/appeal-abandon'));
    }
    
    render() {
        if (this.props.user.status === 'getting session') {
            return <Loading size='7x' />
        } else if (this.props.user.status === 'error') {
            return <Redirect to='/' />;
        } else if (this.props.user.status === 'get session success' && this.props.user.user) {
            let status, body, message, loadingMessageStatus;

            if (this.state.status === 'Loading') {
                status = <Loading size='5x' />;
            } else if (this.state.status === 'access error') {
                return <Redirect to='/error/404' />
            }

            let messages = this.state.messages.map((message, i) => {
                let pinned = false;

                if (this.state.pinnedMessages.indexOf(message.job_id) >= 0) {
                    pinned = true;
                }

                return <InquiryRow key={i} user={this.props.user.user} stage={this.props.match.params.stage} message={message} pin={() => this.pinMessage(message.job_id)} pinned={pinned} load={(id) => this.loadMessage(id, i)} loadedId={this.state.loadedJob.job ? this.state.loadedJob.job.job_id : ''} submitReview={(review, message, star) => this.submit(review, message, star, i)} status={this.state.status} />
            });

            if (this.state.messages.length > 0) {
                body = <React.Fragment>
                    <Pagination totalItems={parseInt(this.state.messageCount)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} />

                    <div className='inquiry-rows'>{messages}</div>

                    <Pagination totalItems={parseInt(this.state.messageCount)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} />
                </React.Fragment>;
            } else {
                body = <div className='text-center'>
                    <h2 className='text-muted'>There are no messages</h2>
                </div>;
            }

            if (this.state.status === 'suspended') {
                message = <div className='alert alert-danger'>You cannot retrieve your messages during a temporary ban.</div>
            }

            return (
                <section id='inquiries'>
                    {status}

                    <div id='message-list-column' className={this.state.showMessageList ? '' : 'hide'}>
                        <div id='message-list-main-column'>
                            <div className='message-filter-buttons-container'>
                                <button className={`btn ${this.state.showing === 'all' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'all'})}>All</button>
                                <button className={`btn ${this.state.showing === 'received' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'received'})}>Received</button>
                                <button className={`btn ${this.state.showing === 'sent' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'sent'})}>Sent</button>
                                <button className={`btn ${this.state.showing === 'pinned' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'pinned'})}>Pinned</button>
                                <button id='close-message-column-button' className='btn btn-light' onClick={() => this.setState({showMessageList: false})}><FontAwesomeIcon icon={faChevronLeft} /></button>
                            </div>
                            
                            {body}
                        </div>

                        <div id='message-list-mini-column' className={this.state.showMessageList ? 'hide' : ''}>
                            <FontAwesomeIcon icon={faBars} size='2x' onClick={() => this.setState({showMessageList: true})} />
                        </div>
                    </div>

                    <div id='message-column'>
                        {loadingMessageStatus}
                        {this.state.loadedJob.job ?
                            <MessageDetails
                            status={this.state.status}
                            job={this.state.loadedJob}
                            stage={this.props.match.params.stage}
                            removeJob={(decision) => this.removeJob(decision)}
                            refresh={(id) => this.loadMessage(id, this.state.jobIndex)}
                            />
                        : <h1 className='load-message-text text-muted'>Select a message to display here</h1>}
                    </div>
                </section>
            )
        }

        return <Redirect to='/' />
    }
}

Inquiries.propTypes = {

};

export default withRouter(connect()(Inquiries));