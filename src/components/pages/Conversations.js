import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LogError } from '../utils/LogError';
import { connect } from 'react-redux';
import fetch from 'axios';
import Pagination from '../utils/Pagination';
import Loading from '../utils/Loading';
import ConversationRow from '../includes/page/ConversationRow';
import { withRouter, Redirect } from 'react-router-dom';
import MessageDetails from '../includes/page/MessageDetails';
import { GetUserNotificationAndMessageCount } from '../../actions/FetchActions';
import { Alert } from '../../actions/AlertActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

class Conversations extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            statusMessage: '',
            offset: 0,
            showing: 'all',
            conversations: [],
            pinnedConversations: [],
            idToLoad: null,
            loadedConversation: {},
            showConversationsList: true
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevState.showing !== this.state.showing || prevState.offset !== this.state.offset || prevProps.location.key !== this.props.location.key) {
            let idToLoad = this.state.idToLoad;
            let loadedConversation = {...prevState.loadedConversation};

            if (prevProps.location.key !== this.props.location.key) {
                idToLoad = null;
                loadedConversation = {};
            }
            
            this.setState({status: 'Loading', idToLoad: idToLoad, loadedConversation, loadedConversation});

            fetch.post(`/api/get/messages/${this.state.showing}`, {offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    // Get the total number of messages so we determine how many pages there are in Pagination component
                    let messageCount = 0;

                    if (resp.data.messages.length > 0) {
                        messageCount = resp.data.messageCount;
                    }

                    this.setState({conversations: resp.data.messages, status: '', messageCount: messageCount, pinnedConversations: resp.data.pinned, showConversationsList: true});
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
        if (this.props.config.isMobile && this.state.showConversationsList) {
            document.body.style.overflowY = 'hidden';
        }

        fetch.post(`/api/get/messages/${this.state.showing}`, {offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                // Get the total number of messages so we determine how many pages there are in Pagination component
                let messageCount = 0;

                if (resp.data.messages.length > 0) {
                    messageCount = resp.data.messageCount;
                }

                this.setState({conversations: resp.data.messages, status: '', messageCount: messageCount, pinnedConversations: resp.data.pinned});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            } else if (resp.data.status === 'suspended') {
                this.setState({status: 'suspended'});
            } else if (resp.data.status === 'access error') {
                this.setState({status: resp.data.status});
            }
        })
        .catch(err => {
            LogError(err, `/api/get/messages/${this.state.showing}`);
            this.setState({status: ''});
        });
    }

    pinMessage(id) {
        this.setState({status: 'Loading'});

        fetch.post('/api/pin', {id: id, type: 'message'})
        .then(resp => {
            if (resp.data.status === 'success') {
                let pinned = this.state.pinnedConversations;

                if (resp.data.action === 'pin') {
                    pinned.push(id);
                } else if (resp.data.action === 'delete') {
                    pinned.splice(pinned.indexOf(id), 1);
                }

                this.setState({status: '', pinnedConversations: pinned});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/pin'));
    }

    loadMessage(id, i) {
        document.body.style.overflowY = '';
        
        this.setState({loadedConversation: this.state.conversations[i], idToLoad: id, showConversationsList: false});
    }

    delete(id, index) {
        this.setState({status: 'Deleting'});

        fetch.post('/api/conversation/delete', {id: id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let conversations = [...this.state.conversations];
                conversations.splice(index, 1);

                this.setState({status: '', conversations: conversations});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/conversation/delete');
            this.setState({status: ''});
        });
    }

    toggleMessageList(bool) {
        if (bool) {
            document.body.style.overflowY = 'hidden';
        } else {
            document.body.style.overflowY = '';
        }

        this.setState({showConversationsList: bool})
    }
    
    render() {
        if (this.props.user.status === 'getting session') {
            return <Loading size='7x' color='black' />;
        } else if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        }
       
        let status, body, message, loadingMessageStatus;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        } else if (this.state.status === 'access error') {
            return <Redirect to='/error/app/500' />
        }

        let messages = this.state.conversations.map((message, i) => {
            let pinned = false;

            if (this.state.pinnedConversations.indexOf(message.conversation_id) >= 0) {
                pinned = true;
            }

            return <ConversationRow key={i} user={this.props.user.user} message={message} pin={() => this.pinMessage(message.conversation_id)} pinned={pinned} load={(id) => this.loadMessage(id, i)} loadedId={this.state.loadedConversation.conversation_id} status={this.state.status} delete={(id) => this.delete(id, i)} />
        });

        if (this.state.conversations.length > 0) {
            body = <React.Fragment>
                <Pagination totalItems={parseInt(this.state.messageCount)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} />

                <div className='inquiry-rows'>{messages}</div>

                <Pagination totalItems={parseInt(this.state.messageCount)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} />
            </React.Fragment>;
        } else {
            body = <div className='text-center'>
                <h2 className='text-dark'>There are no messages</h2>
            </div>;
        }

        if (this.state.status === 'suspended') {
            message = <div className='alert alert-danger'>You cannot retrieve your messages at the moment.</div>
        }

        return (
            <section id='inquiries'>
                {status}

                <div id='message-list-toggle-up-down'><FontAwesomeIcon icon={this.state.showConversationsList ? faChevronUp : faChevronDown} size='3x' onClick={() => this.toggleMessageList(!this.state.showConversationsList)} /></div>

                <div id='message-list-column-container'>
                    <div id='message-list-column' className={this.state.showConversationsList ? '' : 'hide'}>
                        <div id='message-list-main-column'>
                            <div className='message-filter-buttons-container'>
                                <button className={`btn ${this.state.showing === 'all' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'all'})}>All</button>
                                <button className={`btn ${this.state.showing === 'received' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'received'})}>Received</button>
                                <button className={`btn ${this.state.showing === 'sent' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'sent'})}>Sent</button>
                                <button className={`btn ${this.state.showing === 'pinned' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'pinned'})}>Pinned</button>
                            </div>
                            
                            {body}

                            {/* <div className='message-filter-buttons-container mt-3'>
                                <button className='close-message-column-button btn btn-light' onClick={() => this.toggleMessageList(false)}><FontAwesomeIcon icon={faChevronLeft} /></button>
                            </div> */}
                        </div>

                    </div>
                    
                    <div id='message-list-mini-column'>
                        <FontAwesomeIcon icon={this.state.showConversationsList ? faChevronLeft : faBars} size='2x' onClick={() => this.toggleMessageList(!this.state.showConversationsList)} />
                    </div>
                </div>

                <div id='message-column'>
                    {loadingMessageStatus}
                    {this.state.loadedConversation && this.state.loadedConversation.conversation_id ?
                        <MessageDetails conversation={this.state.loadedConversation} user={this.props.user} />
                    : <h1 className='load-message-text text-dark'>Select a message to display here</h1>}
                </div>
            </section>
        )
    }
}

Conversations.propTypes = {

};

const mapStateToProps = state => {
    return {
        config: state.Config
    }
}

export default withRouter(connect(mapStateToProps)(Conversations));