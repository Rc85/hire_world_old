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
import { withRouter, NavLink } from 'react-router-dom';
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
            offset: 10,
            fetchStatus: '',
            offer: null,
            confirmAccept: false,
            reasonInput: false,
            reason: '',
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

            if (nextProps.confirm.data.action === 'abandon job') {
                this.abandonJob(this.state.reason);
                this.props.dispatch(ResetConfirmation());
            }

            if (nextProps.confirm.data.action === 'client agree abandon') {
                this.confirmAbandon('approve');
                this.props.dispatch(ResetConfirmation());
            }

            if (nextProps.confirm.data.action === 'client disagree abandon') {
                this.confirmAbandon('decline');
                this.props.dispatch(ResetConfirmation());
            }

            if (nextProps.confirm.data.action === 'hire') {
                this.submitOffer({
                    price: this.state.job.listing_price,
                    currency: this.state.job.listing_price_currency,
                    numberOfPayments: 0,
                    date: '',
                    term: '',
                    offerType: 'User Determined',
                    paymentType: this.state.job.listing_price_type,
                    amountType: '',
                    paymentPeriod: '',
                    payments: [],
                    status: '',
                    statusMessage: '',
                    offerTypeTooltip: null,
                    confidential: false,
                    confirmConfidentiality: false
                });
                this.props.dispatch(ResetConfirmation());
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.key !== this.props.location.key) {
            fetch.post('/api/get/offer', {job_id: this.props.match.params.id, stage: this.props.match.params.stage})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({
                        status: '',
                        offer: resp.data.offer,
                        job: resp.data.job
                    });

                    fetch.post('/api/get/message', {job_id: this.props.match.params.id, offset: 0, stage: this.props.match.params.stage})
                    .then(resp => {
                        if (resp.data.status === 'success') {
                            this.setState({status: '', messages: resp.data.messages, fetchStatus: '', offset: 10});
                        } else if (resp.status === 'access error') {
                            this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage})
                        }
                    })
                    .catch(err => console.log(err));
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
                console.log('scroll')
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                    if (this.state.fetchStatus !== 'Complete' && this.state.messages.length % 10 === 0) {
                        this.setState({fetchStatus: 'Fetching'});

                        fetch.post('/api/get/message', {job_id: this.props.match.params.id, offset: this.state.offset, stage: this.props.match.params.stage})
                        .then(resp => {
                            console.log(resp)
                            let messages = this.state.messages;

                            if (resp.data.status !== 'fetch error') {
                                messages.push(...resp.data.messages);

                                if (resp.data.messages.length < 10) {
                                    this.setState({messages: messages, offset: this.state.offset + 10, fetchStatus: 'Complete'});
                                } else {
                                    this.setState({messages: messages, offset: this.state.offset + 10, fetchStatus: ''});
                                }
                            } else {
                                this.setState({fetchStatus: 'Complete'});
                            }
                        })
                        .catch(err => console.log(err));
                    }
                }
            });
        }, 250);

        fetch.post('/api/get/offer', {job_id: this.props.match.params.id, stage: this.props.match.params.stage})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({
                    status: '',
                    offer: resp.data.offer,
                    job: resp.data.job
                });

                fetch.post('/api/get/message', {job_id: this.props.match.params.id, offset: 0, stage: this.props.match.params.stage})
                .then(resp => {
                    if (resp.data.status === 'success') {
                        this.setState({status: '', messages: resp.data.messages});
                    } else if (resp.data.status === 'access error') {
                        this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage})
                    }
                })
                .catch(err => console.log(err));
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

        fetch.post('/api/message/reply', {
            recipient: recipient,
            message: message,
            job_id: this.state.job.job_id
        })
        .then(resp => {
            if (resp.data.status === 'send success') {
                let messages = this.state.messages;
                
                messages.unshift(resp.data.reply);

                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage, messages: messages, send: false});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
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
        data['recipient'] = this.state.job.job_client;

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

        fetch.post('/api/job/close', {job_id: this.state.job.job_id})
        .then(resp => {
            console.log(resp.data)
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
            console.log(resp)
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

    abandonJob(reason) {
        this.setState({status: 'Sending'});

        fetch.post('/api/job/abandon', {job_id: this.state.job.job_id, recipient: this.state.job.job_client, reason: reason})
        .then(resp => {
            if (resp.data.status === 'success') {
                let messages = this.state.messages;
                messages.unshift(resp.data.message);

                this.setState({status: 'send success', messages: messages, job: resp.data.job, reasonInput: false});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        });
    }

    confirmAbandon(decision) {
        this.setState({status: 'Sending'});

        fetch.post(`/api/job/abandon/${decision}`, {job_id: this.state.job.job_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', job: resp.data.job});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        console.log(this.state)
        let status, serviceDetails, sendButton, sendMessage, sendStatus, messages, offerConfirmation, fetchStatus, offerButton, confirmation, closeButton, completeButton, incompleteButton, reasonInput, incompleteStatus, abandonedDate;
        let now = moment();

        if (this.state.job) {
            abandonedDate = moment(this.state.job.job_abandoned_date);
        }

        if (abandonedDate) {
            if (abandonedDate.diff(now, 'weeks') >= 3 || this.state.job.job_stage === 'Abandoned') {
                incompleteStatus = <span className='badge badge-danger'>Abandoned</span>;
            } else if (this.state.job.job_stage === 'Incomplete') {
                incompleteStatus = <span className='badge badge-warning'>Incomplete</span>;
            } else if (this.state.job.job_stage === 'Abandoning') {
                incompleteStatus = <span className='badge badge-warning'>Pending</span>
            }
        }

        if (this.state.serviceDetails) {
            serviceDetails = <div>
                <div className='row'>
                    <div className='col-3'>
                        <div className='mb-1'><strong>Listing Title:</strong></div>
                        <div className='mb-1'><strong>Listed By:</strong></div>
                        {this.state.job && !this.state.job.listing_negotiable ? <div className='mb-1'><strong>Price Rate:</strong></div> : <div className='mb-1'><strong>Asking Price:</strong></div>}
                        <div className='mb-1'><strong>Charged Method:</strong></div>
                        <div className='mb-1'><strong>Job Created:</strong></div>
                    </div>
                    
                    <div className='col-9'>
                        <div className='d-flex-between-start mb-1'><span>{this.state.job ? this.state.job.listing_title : ''}</span></div>
                        <div className='mb-1'>{this.state.job ? this.state.job.job_user : ''}</div>
                        <div className='mb-1'>${this.state.job.listing_price}</div>
                        <div className='mb-1'>{this.state.job.listing_price_type} {this.state.job.listing_price_currency}</div>
                        <div className='mb-1'>{this.state.job ? moment(this.state.job.listing_created_date).fromNow() : ''}</div>
                    </div>
                </div>

                <div className='bordered-container rounded mt-3'>
                    {this.state.job.listing_detail}
                </div>
            </div>
        }

        if (this.props.match.params.stage === 'Active' && this.state.job && this.state.job.job_user === this.props.user.user.username) {
            if (this.state.job.job_status !== 'Abandoning') {
                completeButton = <button id='complete-job-button' className={`btn btn-success mr-1`} disabled={this.state.job.job_user_complete} onClick={() => this.props.dispatch(ShowConfirmation('Send request to complete this job?', false, {action: 'user complete job'}))}>{this.state.job.job_user_complete ? <span>Sent</span> : <span>Complete</span>}</button>;

                if (!this.state.reasonInput) {
                    incompleteButton = <button id='abandon-job-button' className='btn btn-danger mr-1' onClick={() => this.setState({reasonInput: true})}>Abandon</button>;
                }
            } else {
                incompleteButton = <button id='abandon-job-button' className='btn btn-danger mr-1' disabled={true}>Abandoning</button>
            }
        }

        if (this.state.reasonInput) {
            reasonInput = <React.Fragment>
                <textarea name='reason' id='reason' rows='6' className='form-control w-100 mb-3' placeholder={`Please provide a reason as to why you are abandoning this job.`} onChange={(e) => this.setState({reason: e.target.value})}></textarea>

                <div className='text-right'>
                    <button className='btn btn-primary mr-1' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to abandon this job?', 'This can negatively impact your reputation.', {action: 'abandon job'}))}>Submit</button>
                    <button className='btn btn-secondary' onClick={() => this.setState({reasonInput: false})}>Cancel</button>
                </div>
            </React.Fragment>
        }
        
        if (this.state.fetchStatus === 'Fetching') {
            fetchStatus = <div className='position-relative'><Loading size='5x' /></div>;
        }

        if (this.state.job && this.state.job.job_status !== 'Closed' && this.state.job.job_stage !== 'Complete') {
            if (!this.state.send) {
                sendButton = <button className='btn btn-primary mr-1' onClick={() => this.setState({send: true, makeOffer: false})}>Message</button>;
            } else {
                sendMessage = <MessageSender send={(message) => this.send(message)} cancel={() => this.setState({send: !this.state.send})} status={this.state.status} statusMessage={this.state.statusMessage} subject={this.state.job.job_subject} />;
            }
        }

        if (this.state.status === 'error' || this.state.status === 'success' || this.state.status === 'send success') {
            sendStatus = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />;
        }

        if (this.state.job && this.props.user.user.username !== this.state.job.job_user && this.props.match.params.stage === 'Inquire') {
            if (this.state.job.listing_negotiable) {
                if (!this.state.makeOffer) {
                    if (this.state.job.job_status !== 'Closed') {
                        offerButton = <button className='btn btn-success mr-1' onClick={() => this.setState({makeOffer: true, send: false})}>{this.state.offer ? 'Edit Offer' : 'Make Offer'}</button>
                    }
                } else {
                    sendMessage = <OfferSender offer={this.state.offer} submit={(data) => this.submitOffer(data)} cancel={() => this.setState({makeOffer: false})} delete={() => this.deleteOffer()}/>;
                }
            } else if (!this.state.job.listing_negotiable && !this.state.offer) {
                offerButton = <button className='btn btn-success mr-1' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to send a hire request?', false, {action: 'hire'}))}>Hire</button>
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

                if (message.message_type === 'Update' && this.props.user.user.username === message.message_sender) {
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
                    return <ConfirmMessage key={i} prompt={true} message={message} job={this.state.job} type='info' approve={() => this.props.dispatch(ShowConfirmation('Proceed to complete this job?', false, {action: 'client complete job'}))} decline={() => this.props.dispatch(ShowConfirmation('Are you sure you want to decline the request?', false, {action: 'decline job complete'}))} />
                }

                if (message.message_type === 'Abandonment' && this.props.user.user.username === message.message_recipient) {
                    if (this.state.job.job_stage !== 'Abandoned' && this.state.job.job_stage !== 'Incomplete') {
                        return <ConfirmMessage key={i} prompt={false} message={message} job={this.state.job} type='info' approve={() => this.props.dispatch(ShowConfirmation('Agree to abandon this job?', false, {action: 'client agree abandon'}))} decline={() => this.props.dispatch(ShowConfirmation('Disagree to abandon this job?', `This will negatively impact the other party's reputation`, {action: 'client disagree abandon'}))} />;
                    }
                }
            });
        }

        if ((this.state.offer && this.state.job.job_user === this.props.user.user.username) || this.props.match.params.stage !== 'Inquire') {
            offerConfirmation = <OfferDetails offer={this.state.offer} accept={() => this.props.dispatch(ShowConfirmation('Are you sure you want to accept this offer?', false, {action: 'accept offer'}))} stage={this.props.match.params.stage} show={this.state.showOfferDetail} toggleOfferDetail={() => this.setState({showOfferDetail: !this.state.showOfferDetail})} />;
        }

        if (this.state.job && this.state.job.job_user === this.props.user.user.username && this.state.job.job_stage === 'Inquire' && this.state.job.job_status !== 'Closed') {
            closeButton = <button id='close-inquiry-button' className='btn btn-danger mr-1' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to close this inquiry?', 'No more messages can be sent or received afterwards for this inquiry.', {action: 'close inquiry'}))}>Close</button>
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
                    <Response header='Congratulations' message={`The offer was accepted and a job has been created. Keep up the good work!`} />
                </div>
            )
        } else if (this.state.status === 'job complete') {
            return(
                <div className='blue-panel rounded w-100'>
                    <Response header='Congratulations' message={`The job has been successfully completed! Be sure to give the other party a review using the link in the 'Completed' tab.`} />
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

                            {completeButton}
                            {completeButton ? <UncontrolledTooltip placement='top' target='complete-job-button' delay={{show: 0, hide: 0}}>{!this.state.job.job_user_complete ? <span>Complete Job<br />This will send an approval for completion to the other party</span> : <span>Sent</span>}</UncontrolledTooltip> : ''}

                            {incompleteButton}
                            {incompleteButton ? <UncontrolledTooltip place='top' target='abandon-job-button' delay={{show: 0, hide: 0}}>Abandon Job<br />NOTE: Abandoning a job may negatively impact your reputation. See FAQs for more details.</UncontrolledTooltip> : ''}
                        </div>
                    </div>

                    <div className='grey-panel rounded mb-3'>
                        <div className='d-flex-between-start mb-3'>
                            <strong>Listing Details</strong>
                            <button className='btn btn-info btn-sm' onClick={() => this.setState({serviceDetails: !this.state.serviceDetails})}>{this.state.serviceDetails ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}</button>
                        </div>

                        {serviceDetails}
                        <div className='text-right'><small className='text-muted'>Listing ID: {this.state.messages ? this.state.job.job_service_id : ''}</small></div>
                    </div>

                    <div className='messages-container'>
                        {offerConfirmation}

                        <h3 className='mb-1'>
                            {this.state.job ? this.state.job.job_subject : ''} {this.state.job && this.state.job.job_status === 'Closed' ? <span className='badge badge-danger'>Closed</span> : '' } {this.state.job && this.state.job.job_stage === 'Complete' ? <span className='badge badge-success'>Completed</span> : ''} {incompleteStatus}
                        </h3>

                        <div className='d-flex justify-content-end mb-3'>
                            {offerButton}
                            {sendButton}
                            <NavLink to={`/dashboard/message/${this.props.match.params.stage}/${this.props.match.params.id}/details`}><button className='btn btn-info'>Refresh</button></NavLink>
                        </div>

                        <div className='mb-3'>
                            {sendStatus}
                            {sendMessage}
                            {reasonInput}
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