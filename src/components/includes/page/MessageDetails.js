import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import fetch from 'axios';
import Loading from '../../utils/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import MessageSender from '../page/MessageSender';
import Alert from '../../utils/Alert';
import Response from '../../pages/Response';

const mapStateToProps = state => {
    return {
        user: state.Login.user
    };
}

const styles = {
    profilePic: {
        background: '',
        backgroundSize: 'cover',
        backgroundPosition: 'center top'
    }
}

class MessageDetails extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            statusMessage: '',
            messages: null,
            serviceDetails: false,
            send: false
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/message', {id: this.props.match.params.id})
        .then(resp => {
            console.log(resp.data)
            if (resp.data.status === 'success') {
                this.setState({status: '', messages: resp.data.messages})
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    send(subject, message) {
        let recipient;

        if (this.props.user.username === this.state.messages[0].job_user) {
            recipient = this.state.messages[0].job_client;
        } else {
            recipient = this.state.messages[0].job_user;
        }

        this.setState({status: 'Sending'});

        fetch.post('/api/message/reply', {
            message: this.state.messages[0].message_parent,
            recipient: recipient,
            belongs_to: this.state.messages[0].belongs_to_job,
            subject: subject,
            reply: message,
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

    render() {
        let status, serviceDetails, sendButton, sendMessage, sendStatus, messages, messageContainer;

        if (this.state.serviceDetails) {
            serviceDetails = <div>
                {this.state.messages[0].service_detail}
            </div>
        }

        if (!this.state.send) {
            sendButton = <button className='btn btn-primary' onClick={() => this.setState({send: !this.state.send})}>Send Message</button>;
        } else {
            sendMessage = <MessageSender send={(subject, message) => this.send(subject, message)} cancel={() => this.setState({send: !this.state.send})} status={this.state.status} statusMessage={this.state.statusMessage} subject={this.state.messages ? this.state.messages.pop().message_subject : ''} />;
        }

        if (this.state.status === 'send success') {
            sendStatus = <Alert status='success' message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />;
        }

        if (this.state.messages) {
            messages = this.state.messages.map((message, i) => {
                let messageRowClass, messagePanelClass, text;
                let profilePicAlignment = 'mr-auto';

                if (message.message_sender === this.props.user.username) {
                    messageRowClass = 'message-row';
                    messagePanelClass = 'message-panel three-rounded';
                    text = 'Sent';
                } else {
                    messageRowClass = 'message-row-reverse';
                    messagePanelClass = 'message-panel-reverse three-rounded-reverse';
                    profilePicAlignment = 'ml-auto';
                    text = 'Received';
                }

                return <div key={i} className={`${messageRowClass} mb-3`}>
                    <div className='col-3'>
                        <div className={`profile-pic w-75 ${profilePicAlignment}`} style={{background: `url(${message.avatar_url}) center top / cover`}}></div>
                        <div className={`w-75 text-center ${profilePicAlignment}`}>{message.message_sender}</div>
                        <div></div>
                    </div>
                    <div className='col-9'>
                        <div className={messagePanelClass}>
                            <div className='mb-3'><small>{text} {message.message_date}</small></div>
                            <div className='mb-3'>{message.message_body}</div>
                            <div className='text-right'><small className='text-muted'>Message ID: {message.message_id}</small></div>
                        </div>
                    </div>
                </div>
            });

            messageContainer = <div className='messages-container'>
                <div className='d-flex-between-start mb-3'>
                    <h3>{this.state.messages ? this.state.messages.pop().message_subject : ''}</h3>

                    {sendButton}
                </div>

                <div className='mb-3'>
                    {sendStatus}
                    {sendMessage}
                </div>

                <div className='messages'>
                    {messages}
                </div>
            </div>
        }

        if (this.state.status === 'Loading') {
            return(
                <div className='blue-panel shallow three-rounded w-100'><Loading size='7x' /></div>
            )
        } else if (this.state.status === 'access error') {
            return(
                <div className='blue-panel shallow three-rounded w-100'><Response header={'Error'} message={this.state.statusMessage} /></div>
            )
        } else {
            return(
                <div className='blue-panel shallow three-rounded w-100'>
                    {status}
                    <div className='d-flex-between-start mb-3'>
                        <small className='text-white-50'>Job ID: {this.state.messages ? this.state.messages[0].job_id : ''}</small>
                        <button className='btn btn-light' onClick={() => this.props.history.goBack()}>Back</button>
                    </div>

                    <div className='grey-panel rounded mb-3'>
                        <div className='row'>
                            <div className='col-3'>
                                <div className='mb-1'><strong>Service:</strong></div>
                                <div className='mb-1'><strong>Service Provider:</strong></div>
                                <div className='mb-1'><strong>Started:</strong></div>
                                <div className='mb-1'><strong>Details</strong></div>
                            </div>
                            
                            <div className='col-9'>
                                <div className='d-flex-between-start mb-1'>
                                    <span>{this.state.messages ? this.state.messages[0].service_name : ''}</span>
                                    <small className='text-muted'>Service ID: {this.state.messages ? this.state.messages[0].job_service_id : ''}</small>
                                </div>
                                <div className='mb-1'>{this.state.messages ? this.state.messages[0].job_user : ''}</div>
                                <div className='mb-1'>{this.state.messages ? this.state.messages[0].job_created_date : ''}</div>
                                <div className='mb-1'><button className='btn btn-info btn-sm' onClick={() => this.setState({serviceDetails: !this.state.serviceDetails})}><FontAwesomeIcon icon={faCaretDown} size='1x'/></button></div>
                            </div>
                        </div>
                        {serviceDetails}
                    </div>

                    {messageContainer}
                </div>
            )
        }
    }
}

export default withRouter(connect(mapStateToProps)(MessageDetails));