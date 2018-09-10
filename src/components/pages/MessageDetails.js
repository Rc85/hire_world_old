import React, { Component } from 'react';
import Loading from '../utils/Loading';
import UserMessage from '../includes/page/UserMessage';
import MessageSender from '../includes/page/MessageSender';
import Alert from '../utils/Alert';
import OfferSender from '../includes/page/OfferSender';
import Response from '../pages/Response';
import OfferDetails from '../includes/page/OfferDetails';
import ConfirmMessage from '../includes/page/ConfirmMessage';
import SystemMessage from '../includes/page/SystemMessage';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faTimes, faCaretUp, faCheck } from '@fortawesome/free-solid-svg-icons';
import { GetMessage, SendMessage } from '../utils/Utils';
import { connect } from 'react-redux';
import { ShowConfirmation, ResetConfirmation } from '../../actions/ConfirmationActions';
import { UncontrolledTooltip } from 'reactstrap';
import fetch from 'axios';
import moment from 'moment';

class MessageDetails extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            statusMessage: '',
            job: null,
            messages: [],
            serviceDetails: false,
            send: false,
            makeOffer: false,
            offset: 0,
            fetchStatus: '',
            offer: null,
            confirmAccept: false,
            showOfferDetail: this.props.match.params.stage === 'Inquire' ? true : false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data && nextProps.confirm.option) {
            if (nextProps.confirm.data.action === 'accept offer') {
                this.acceptOffer();
                this.props.dispatch(ResetConfirmation());
            }

            if (nextProps.confirm.data.action === 'close inquiry') {
                this.closeInquiry();
                this.props.dispatch(ResetConfirmation());
            }

            if (nextProps.confirm.data.action === 'user complete job') {
                this.completeJob();
                this.props.dispatch(ResetConfirmation());
            }

            if (nextProps.confirm.data.action === 'client complete job') {
                this.approveCompleteJob();
                this.props.dispatch(ResetConfirmation());
            }

            if (nextProps.confirm.data.action === 'decline job complete') {
                this.declineCompleteJob(nextProps.confirm.data.message);
                this.props.dispatch(ResetConfirmation());
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.id !== this.props.match.params.id) {
            fetch.post('/api/get/offer', {id: this.props.match.params.id, stage: this.props.match.params.stage})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({
                        status: '',
                        offer: resp.data.offer,
                        job: resp.data.job
                    });

                    GetMessage(this.props.match.params.id, this.props.match.params.stage, 0, resp => {
                        if (resp.status === 'success') {
                            this.setState({status: '', messages: resp.messages});
                        } else if (resp.status === 'access error') {
                            this.setState({status: resp.status, statusMessage: resp.statusMessage})
                        }
                    });
                } else if (resp.data.status === 'access error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage})
                }
            })
            .catch(err => console.log(err));
        }
    }
    
    componentDidMount() {
        setTimeout(() => {
            window.addEventListener('scroll', this.scrollFetch = () => {
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                    if (this.state.fetchStatus !== 'Complete' && this.state.messages.length % 10 === 0) {
                        this.setState({fetchStatus: 'Fetching'});

                        GetMessage(this.props.match.params.id, this.props.match.params.stage, this.state.offset + 10, resp => {
                            let messages = this.state.messages;

                            if (resp.status !== 'fetch error') {
                                messages.push(...resp.messages);

                                if (resp.messages.length < 10) {
                                    this.setState({messages: messages, offset: this.state.offset + 10, fetchStatus: 'Complete'});
                                } else {
                                    this.setState({messages: messages, offset: this.state.offset + 10, fetchStatus: ''});
                                }
                            } else {
                                this.setState({fetchStatus: 'Complete'});
                            }
                        });
                    }
                }
            });
        }, 250);

        fetch.post('/api/get/offer', {id: this.props.match.params.id, stage: this.props.match.params.stage})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({
                    status: '',
                    offer: resp.data.offer,
                    job: resp.data.job
                });

                GetMessage(this.props.match.params.id, this.props.match.params.stage, 0, resp => {
                    if (resp.status === 'success') {
                        this.setState({status: '', messages: resp.messages});
                    } else if (resp.status === 'access error') {
                        this.setState({status: resp.status, statusMessage: resp.statusMessage})
                    }
                });
            } else if (resp.data.status === 'access error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage})
            }
        })
        .catch(err => console.log(err));
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.scrollFetch);
    }

    send(message) {
        let recipient;

        if (this.props.user.user.username === this.state.job.job_user) {
            recipient = this.state.job.job_client;
        } else {
            recipient = this.state.job.job_user;
        }

        this.setState({status: 'Sending'});

        SendMessage({
            recipient: recipient,
            message: message,
            job_id: this.state.job.job_id
        }, (resp) => {
            if (resp.status === 'success') {
                let messages = this.state.messages;
                
                messages.unshift(resp.reply);

                this.setState({status: resp.status, statusMessage: resp.statusMessage, messages: messages, send: false});
            } else {
                this.setState({status: resp.status, statusMessage: resp.statusMessage});
            }
        });
    }

    submitOffer(data) {
        let url;

        if (this.state.offer) {
            url = '/api/offer/edit';
            data['offer_id'] = this.state.offer.offer_id;
        } else {
            url = '/api/offer/submit';
        }

        this.setState({status: 'Sending'});
        data['job_id'] = this.state.job.job_id;

        fetch.post(url, data)
        .then(resp => {
            if (resp.data.status === 'success') {
                let messages = this.state.messages;

                messages.unshift(resp.data.message);

                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage, makeOffer: false, messages: messages, offer: resp.data.offer});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    deleteOffer() {
        this.setState({status: 'Sending'});

        fetch.post('/api/offer/delete', {job_id: this.state.job.job_id, offer_id: this.state.offer.offer_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let messages = this.state.messages;
                messages.unshift(resp.data.message);

                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage, messages: messages, makeOffer: false, offer: null});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    acceptOffer() {
        this.setState({status: 'Sending'});

        fetch.post('/api/offer/accept', {job_id: this.state.job.job_id, offer_id: this.state.offer.offer_id})
        .then(resp => {
            if (resp.data.status === 'offer accepted') {
                this.setState({status: resp.data.status});
            } else {
                resp.send({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    closeInquiry() {
        this.setState({status: 'Sending'});

        fetch.post('/api/message/close', {job_id: this.state.job.job_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage, job: resp.data.job});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    deleteMessage(id, index) {
        this.setState({status: 'Sending'});

        fetch.post('/api/message/delete', {message_id: id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let messages = this.state.messages;
                messages.splice(index, 1);

                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage, messages: messages});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    editMessage(id, message, index) {
        this.setState({status: 'Sending'});

        fetch.post('/api/message/edit', {message_id: id, message: message})
        .then(resp => {
            if (resp.data.status === 'success') {
                let messages = this.state.messages;
                messages[index] = resp.data.message;

                this.setState({status: '', messages: messages});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        });
    }

    completeJob() {
        this.setState({status: 'Sending'});

        fetch.post('/api/job/complete', {job_id: this.state.job.job_id, recipient: this.state.job.job_client})
        .then(resp => {
            if (resp.data.status === 'success') {
                let messages = this.state.messages;

                if (resp.data.message) {
                    messages.unshift(resp.data.message);
                }

                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage, messages: messages, job: resp.data.job});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    approveCompleteJob() {
        this.setState({status: 'Sending'});

        fetch.post('/api/job/complete/approve', {job_id: this.state.job.job_id, recipient: this.state.job.job_user})
        .then(resp => {
            if (resp.data.status === 'job complete') {
                this.setState({status: resp.data.status});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    declineCompleteJob(message) {
        this.setState({status: 'Sending'});

        fetch.post('/api/job/complete/decline', {job_id: this.state.job.job_id, message: message, recipient: this.state.job.job_user})
        .then(resp => {
            if (resp.data.status === 'success') {
                let messages = this.state.messages;
                messages.unshift(resp.data.message);

                this.setState({status: '', messages: messages, job: resp.data.job});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        console.log(this.state)
        let status, serviceDetails, sendButton, sendMessage, sendStatus, messages, offerConfirmation, fetchStatus, offerButton, confirmation, closeButton, completeButton, incompleteButton;

        if (this.state.serviceDetails) {
            serviceDetails = <div>
                <div className='row'>
                    <div className='col-3'>
                        <div className='mb-1'><strong>Service:</strong></div>
                        <div className='mb-1'><strong>Service Provider:</strong></div>
                        <div className='mb-1'><strong>Job Created:</strong></div>
                    </div>
                    
                    <div className='col-9'>
                        <div className='d-flex-between-start mb-1'><span>{this.state.job ? this.state.job.service_name : ''}</span></div>
                        <div className='mb-1'>{this.state.job ? this.state.job.job_user : ''}</div>
                        <div className='mb-1'>{this.state.job ? moment(this.state.job.job_created_date).fromNow() : ''}</div>
                    </div>
                </div>

                <div className='bordered-container rounded mt-3'>
                    {this.state.job.service_detail}
                </div>
            </div>
        }

        if (this.props.match.params.stage === 'Active' && this.state.job && this.state.job.job_user === this.props.user.user.username) {
            completeButton = <div id='complete-job-button'><button className={`btn btn-success mr-1`} disabled={this.state.job.job_user_complete} onClick={() => this.props.dispatch(ShowConfirmation('Send request to complete this job?', false, {action: 'user complete job'}))}><FontAwesomeIcon icon={faCheck} size='sm' /></button></div>;

            incompleteButton = <button id='abandon-job-button' className='btn btn-danger' onClick={() => this.abandonJob()}><FontAwesomeIcon icon={faTimes} /></button>;
        }
        
        if (this.state.fetchStatus === 'Fetching') {
            fetchStatus = <div className='position-relative'><Loading size='5x' /></div>;
        }

        if (this.state.job && this.state.job.job_status !== 'Closed' && this.state.job.job_stage !== 'Complete') {
            if (!this.state.send) {
                sendButton = <button className='btn btn-primary' onClick={() => this.setState({send: true, makeOffer: false})}>Message</button>;
            } else {
                sendMessage = <MessageSender send={(message) => this.send(message)} cancel={() => this.setState({send: !this.state.send})} status={this.state.status} statusMessage={this.state.statusMessage} subject={this.state.job.job_subject} />;
            }
        }

        if (this.state.status === 'error' || this.state.status === 'success' || this.state.status === 'send success') {
            sendStatus = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />;
        }

        if (this.state.job && this.props.user.user.username !== this.state.job.job_user && this.props.match.params.stage === 'Inquire') {
            if (!this.state.makeOffer) {
                if (this.state.job.job_status !== 'Closed') {
                    offerButton = <button className='btn btn-success' onClick={() => this.setState({makeOffer: true, send: false})}>{this.state.offer ? 'Edit Offer' : 'Make Offer'}</button>
                }
            } else {
                sendMessage = <OfferSender offer={this.state.offer} submit={(data) => this.submitOffer(data)} cancel={() => this.setState({makeOffer: false})} delete={() => this.deleteOffer()}/>;
            }
        }

        if (this.state.messages) {
            messages = this.state.messages.map((message, i) => {
                let messageRowClass, messagePanelClass, text;
                let profilePicAlignment = 'mr-auto';

                if (message.message_sender === this.props.user.user.username) {
                    messageRowClass = 'message-row';
                    messagePanelClass = 'message-panel three-rounded';
                    text = 'Sent';
                } else {
                    messageRowClass = 'message-row-reverse';
                    messagePanelClass = 'message-panel-reverse three-rounded-reverse';
                    profilePicAlignment = 'ml-auto';
                    text = 'Received';
                }

                if (message.message_type === 'User') {
                    return <UserMessage key={i} rowClass={messageRowClass} panelClass={messagePanelClass} text={text} profilePicAlignment={profilePicAlignment} message={message} user={this.props.user.user} delete={() => this.deleteMessage(message.message_id, i)} edit={(msg) => this.editMessage(message.message_id, msg, i)} job={this.state.job} />
                }
                
                if (message.message_type === 'Update' && this.props.user.user.username === message.message_recipient) {
                    return <SystemMessage key={i} message={message} type='info' />
                }
                
                if (message.message_type === 'Update' && !message.message_recipient) {
                    return <SystemMessage key={i} message={message} type='info' />
                }
                
                if (message.message_type === 'Warning' && this.props.user.user.username === message.message_recipient) {
                    return <SystemMessage key={i} message={message} type='warning' />
                }
                
                if (message.message_type === 'Warning' && !message.message_recipient) {
                    return <SystemMessage key={i} message={message} type='warning' />
                }

                if (message.message_type === 'Confirmation' && this.props.user.user.username === message.message_recipient) {
                    return <ConfirmMessage key={i} message={message} job={this.state.job} type='info' approve={() => this.props.dispatch(ShowConfirmation('Proceed to complete this job?', false, {action: 'client complete job'}))} decline={(message) => this.props.dispatch(ShowConfirmation('Are you sure you want to decline the request?', false, {action: 'decline job complete', message: message}))} />
                }
            });
        }

        if ((this.state.offer && this.state.job.job_user === this.props.user.user.username) || this.props.match.params.stage !== 'Inquire') {
            offerConfirmation = <OfferDetails offer={this.state.offer} accept={() => this.props.dispatch(ShowConfirmation('Are you sure you want to accept this offer?', false, {action: 'accept offer'}))} stage={this.props.match.params.stage} show={this.state.showOfferDetail} toggleOfferDetail={() => this.setState({showOfferDetail: !this.state.showOfferDetail})} />;
        }

        if (this.state.job && this.state.job.job_user === this.props.user.user.username && this.state.job.job_stage === 'Inquire' && this.state.job.job_status !== 'Closed') {
            closeButton = <button id='close-inquiry-button' className='btn btn-danger' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to close this inquiry?', 'No more messages can be sent or received afterwards for this inquiry.', {action: 'close inquiry'}))}><FontAwesomeIcon icon={faTimes} /></button>
        }

        if (this.state.status === 'Loading') {
            return(
                <div className='blue-panel shallow three-rounded w-100'><Loading size='7x' /></div>
            )
        } else if (this.state.status === 'fetch error' || this.state.status === 'access error') {
            return(
                <div className='blue-panel three-rounded w-100'><Response code={404} header='Not Found' message={this.state.statusMessage} /></div>
            )
        } else if (this.state.status === 'offer accepted') {
            return(
                <div className='blue-panel rounded w-100'>
                    <Response header='Congratulations' message={`You've accepted the other party's offer. Keep up the good work!`} />
                </div>
            )
        } else if (this.state.status === 'job complete') {
            return(
                <div className='blue-panel rounded w-100'>
                    <Response header='Congratulations' message={`You've successfully completed the job. Be sure to give the other party a review`} />
                </div>
            )
        } else {
            return(
                <div className='blue-panel shallow three-rounded w-100'>
                    {confirmation}
                    {status}
                    <div className='d-flex-between-start mb-3'>
                        <small className='text-white-50'>Job ID: {this.state.job ? this.state.job.job_id : ''}</small>
                        <div className='d-flex'>
                            <button className='btn btn-secondary mr-1' onClick={() => this.props.history.goBack()}>Back</button>
                            {closeButton}
                            {closeButton ? <UncontrolledTooltip placement='right' target='close-inquiry-button'>Close Inquiry</UncontrolledTooltip> : ''}
                            {completeButton}
                            {completeButton ? <UncontrolledTooltip placement='top' target='complete-job-button' delay={{show: 0, hide: 0}}>{this.state.job.job_user_complete ? <span>Request already sent</span> : <span>Complete Job<br />This will send an approval for completion to the other party.</span>}</UncontrolledTooltip> : ''}
                            {incompleteButton}
                            {incompleteButton ? <UncontrolledTooltip place='top' target='abandon-job-button' delay={{show: 0, hide: 0}}>Abandon Job<br />NOTE: Abandoning a job will impact your reputation within the community.</UncontrolledTooltip> : ''}
                        </div>
                    </div>

                    <div className='grey-panel rounded mb-3'>
                        <div className='d-flex-between-start mb-3'>
                            <strong>Service Details</strong>
                            <button className='btn btn-info btn-sm' onClick={() => this.setState({serviceDetails: !this.state.serviceDetails})}>{this.state.serviceDetails ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}</button>
                        </div>

                        {serviceDetails}
                        <div className='text-right'><small className='text-muted'>Service ID: {this.state.messages ? this.state.job.job_service_id : ''}</small></div>
                    </div>

                    <div className='messages-container'>
                        {offerConfirmation}
                        <div className='d-flex-between-start mb-3'>
                            <h3>
                                {this.state.job ? this.state.job.job_subject : ''} {this.state.job && this.state.job.job_status === 'Closed' ? <span className='badge badge-danger'>Closed</span> : '' } {this.state.job && this.state.job.job_stage === 'Complete' ? <span className='badge badge-success'>Completed</span> : ''}
                            </h3>

                            <div>{offerButton} {sendButton}</div>
                        </div>

                        <div className='mb-3'>
                            {sendStatus}
                            {sendMessage}
                        </div>

                        <hr/>

                        <div className='messages'>
                            {messages}
                            {fetchStatus}
                        </div>
                    </div>
                </div>
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default withRouter(connect(mapStateToProps)(MessageDetails));