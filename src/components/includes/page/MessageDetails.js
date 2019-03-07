import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MessageSender from './MessageSender';
import fetch from 'axios';
import MessageRow from './MessageRow';
import { Alert } from '../../../actions/AlertActions';
import { connect } from 'react-redux';
import { LogError } from '../../utils/LogError';
import Loading from '../../utils/Loading';

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
                window.scrollTo(0, 0);
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

    reply(message) {
        this.setState({sendStatus: 'Sending'});

        fetch.post('/api/conversation/reply', {message: message, id: this.props.conversation.conversation_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let messages = [...this.state.messages];
                messages.unshift(resp.data.message);

                this.setState({sendStatus: 'send success', messages: messages});
            } else if (resp.data.status === 'error') {
                this.setState({sendStatus: 'send error'});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            this.setState({sendStatus: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
            LogError(err, '/api/conversation/submit');
        });
    }
    
    render() {
        let status;

        if (this.state.status === 'Loading Message') {
            status = <Loading size='5x' color='black' />;
        }

        return (
            <div id='message-details'>
                {status}
                {this.state.reply ? '' : <div id='reply-button' className='text-right mb-3'><button className='btn btn-primary btn-sm' onClick={() => this.setState({reply: true})}>Reply</button></div>}

                <MessageSender key={this.state.messages.length} id='reply-container' className={this.state.reply ? 'show' : ''} subject={this.state.messages.length > 0 ? this.props.conversation.conversation_subject : ''} send={(message) => this.reply(message)} status={this.state.sendStatus} cancel={this.state.reply ? () => this.setState({reply: false}) : null} />

                {this.state.messages.map((message, i) => {
                    let messageAuthor, messageType, approve, decline;

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