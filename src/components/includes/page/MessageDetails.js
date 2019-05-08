import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MessageSender from './MessageSender';
import fetch from 'axios';
import MessageRow from './MessageRow';
import { Alert } from '../../../actions/AlertActions';
import { connect } from 'react-redux';
import { LogError } from '../../utils/LogError';
import Loading from '../../utils/Loading';
import { GetUserNotificationAndMessageCount } from '../../../actions/FetchActions';

class MessageDetails extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            messages: [],
            sendStatus: '',
            reply: false
        }
    }
    
    /* componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props.conversation) != JSON.stringify(nextProps.conversation)) {
            this.setState({status: 'Loading Message'});

            fetch.post('/api/get/message', {message_id: nextProps.conversation.conversation_id})
            .then(resp => {
                (resp);
                if (resp.data.status === 'success') {
                    this.setState({status: '', messages: resp.data.messages});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                }
            })
            .catch(err => {
                this.setState({status: ''});
                LogError(err, '/api/get/message');
                this.props.dispatch('error', 'An error occurred');
            });
        }
    } */
    
    componentDidMount() {
        this.setState({status: 'Loading Message'});

        fetch.post('/api/get/message', {message_id: this.props.conversation.conversation_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(GetUserNotificationAndMessageCount());
                this.setState({status: '', messages: resp.data.messages});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            this.setState({status: ''});
            LogError(err, '/api/get/message');
            this.props.dispatch('error', 'An error occurred');
        });
    }

    reply(message, verified) {
        this.setState({sendStatus: 'Sending'});

        fetch.post('/api/conversation/reply', {message: message, id: this.props.conversation.conversation_id, verified: verified})
        .then(resp => {
            if (resp.data.status === 'success') {
                let messages = [...this.state.messages];
                messages.unshift(resp.data.message);

                this.setState({sendStatus: 'send success', messages: messages});

                setTimeout(() => {
                   this.setState({sendStatus: ''}); 
                }, 5000);
            } else if (resp.data.status === 'error') {
                this.setState({sendStatus: 'send error'});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            this.setState({sendStatus: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
            LogError(err, '/api/conversation/reply');
        });
    }
    
    render() {
        if (this.state.status === 'Loading') {
            return <Loading size='5x' />;
        }
        
        return (
            <div id='message-details'>
                {this.state.reply ? '' : <div id='reply-button' className='text-right mb-3'><button className='btn btn-primary btn-sm' onClick={() => this.setState({reply: true})}>Reply</button></div>}

                <MessageSender key={this.state.messages.length} id='reply-container' className={this.state.reply ? 'show' : ''} subject={this.state.messages.length > 0 ? this.props.conversation.conversation_subject : ''} send={(message, verified) => this.reply(message, verified)} status={this.state.sendStatus} cancel={this.state.reply ? () => this.setState({reply: false}) : null} placeholder='Type your reply here' />

                {this.state.messages.map((message, i) => {
                    let messageAuthor;

                    if (message.message_creator === this.props.user.user.username) {
                        messageAuthor = 'owner';
                    } else {
                        messageAuthor = 'sender';
                    }

                    return <MessageRow key={i} author={messageAuthor} message={message} />;
                })}
            </div>
        );
    }
}

MessageDetails.propTypes = {

};

export default connect()(MessageDetails);