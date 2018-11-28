import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LogError } from '../utils/LogError';
import { connect } from 'react-redux';
import fetch from 'axios';
import Pagination from '../utils/Pagination';
import MessageRow from '../includes/page/MessageRow';
import Loading from '../utils/Loading';
import InquiryRow from '../includes/page/InquiryRow';
import { withRouter } from 'react-router-dom';

class Inquiries extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            statusMessage: '',
            offset: 0,
            showing: 'all',
            messages: [],
            pinnedMessages: []
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevState.showing !== this.state.showing || prevState.offset !== this.state.offset || prevProps.location.key !== this.props.location.key) {
            this.setState({status: 'Loading'});

            fetch.post(`/api/get/messages/${this.state.showing}`, {stage: 'Inquire', offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    // Get the total number of messages so we determine how many pages there are in Pagination component
                    let messageCount = 0;

                    if (resp.data.messages.length > 0) {
                        messageCount = resp.data.messages[0].messageCount;
                    }

                    this.setState({messages: resp.data.messages, status: '', messageCount: messageCount, pinnedMessages: resp.data.pinned});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});

                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                } else if (resp.data.status === 'suspended') {
                    this.setState({status: 'suspended'});
                }
            })
            .catch(err => LogError(err, `/api/get/messages/${this.state.showing}`));
        }
    }
    
    componentDidMount() {
        fetch.post(`/api/get/messages/${this.state.showing}`, {stage: 'Inquire', offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                // Get the total number of messages so we determine how many pages there are in Pagination component
                let messageCount = 0;

                if (resp.data.messages.length > 0) {
                    messageCount = resp.data.messages[0].messageCount;
                }

                this.setState({messages: resp.data.messages, status: '', messageCount: messageCount, pinnedMessages: resp.data.pinned});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            } else if (resp.data.status === 'suspended') {
                this.setState({status: 'suspended'});
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
    
    render() {
        let status, body, message;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        let messages = this.state.messages.map((message, i) => {
            let pinned = false;

            if (this.state.pinnedMessages.indexOf(message.job_id) >= 0) {
                pinned = true;
            }

            return <InquiryRow key={i} user={this.props.user.user} stage='Inquire' message={message} pin={() => this.pinMessage(message.job_id)} pinned={pinned} />
        });

        if (this.state.messages.length > 0) {
            body = <React.Fragment>
                <Pagination totalItems={parseInt(this.state.messageCount)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} />

                <hr />

                {messages}

                <hr />

                <Pagination totalItems={parseInt(this.state.messageCount)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} />
            </React.Fragment>;
        } else {
            body = <div className='text-center p-5'>
                <h2 className='text-muted'>There are no inquiries at the moment</h2>
            </div>;
        }

        if (this.state.status === 'suspended') {
            message = <div className='alert alert-danger'>You cannot retrieve your messages during a temporary ban.</div>
        }

        return (
            <section id='inquiries' className='blue-panel shallow three-rounded w-100'>
                {status}
                {message}
                <div className='btn-group'>
                    <button className={`btn ${this.state.showing === 'all' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'all'})}>All</button>
                    <button className={`btn ${this.state.showing === 'received' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'received'})}>Received</button>
                    <button className={`btn ${this.state.showing === 'sent' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'sent'})}>Sent</button>
                    <button className={`btn ${this.state.showing === 'pinned' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'pinned'})}>Pinned</button>
                </div>

                {body}
            </section>
        );
    }
}

Inquiries.propTypes = {

};

export default withRouter(connect()(Inquiries));