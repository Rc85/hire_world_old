import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import fetch from 'axios';
import Loading from '../utils/Loading';
import PropTypes from 'prop-types';
import { Alert } from '../../actions/AlertActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import { ShowConfirmation, ResetConfirmation } from '../../actions/ConfirmationActions';
import { connect } from 'react-redux';
import MessageRow from '../includes/page/MessageRow';
import Pagination from '../utils/Pagination';

class Messages extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            messages: [],
            status: 'Loading',
            statusMessage: '',
            selected: [],
            showing: 'received',
            messageCount: 0,
            offset: 0,
            pinnedMessages: []
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data && nextProps.confirm.option) {
            if (nextProps.confirm.data.action === 'delete selected') {
                this.deleteSelected();
                this.props.dispatch(ResetConfirmation());
            }

            if (nextProps.confirm.data.action === 'delete message') {
                this.deleteMessage(nextProps.confirm.data.id, nextProps.confirm.data.index);
                this.props.dispatch(ResetConfirmation());
            }
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        console.log('this')
        if (prevProps.user.user !== this.props.user.user || this.state.showing !== prevState.showing) {
            fetch.post(`/api/get/messages/${this.state.showing}`, {stage: this.props.match.params.stage, user: this.props.user.user.user_type, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let messageCount = 0;

                    if (resp.data.messages.length > 0) {
                        messageCount = resp.data.messages[0].message_count;
                    }

                    this.setState({messages: resp.data.messages, status: '', messageCount: messageCount, pinnedMessages: resp.data.pinned});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});

                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                }
            })
            .catch(err => console.log(err));
        }
    }
    
    /* componentDidMount() {
        console.log(this.props.user.user);
        fetch.post(`/api/get/messages/${this.state.showing}`, {stage: this.props.match.params.stage, user: this.props.user.user.user_type, offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                let messageCount = 0;

                if (resp.data.messages.length > 0) {
                    messageCount = resp.data.messages[0].message_count;
                }

                this.setState({messages: resp.data.messages, status: '', messageCount: messageCount, pinnedMessages: resp.data.pinned});

            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                    
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => console.log(err));
    } */

    selectAllMessage(checkbox) {
        let checkboxes = document.getElementsByClassName('select-message-checkbox');
        let selected = this.state.selected;

        if (checkbox.checked) {
            for (let checkbox of checkboxes) {
                if (selected.indexOf(checkbox.id) < 0) {
                    selected.push(checkbox.id);
                }

                checkbox.checked = true;
            }
        } else {
            selected = [];

            for (let checkbox of checkboxes) {
                checkbox.checked = false;
            }
        }

        this.setState({selected: selected});
    }

    selectMessage(checkbox) {
        document.getElementById('select-all-checkbox').checked = false;
        let selected = this.state.selected;

        if (checkbox.checked) {
            if (selected.indexOf(checkbox.id) < 0) {
                selected.push(checkbox.id);
            }
        } else {
            if (selected.indexOf(checkbox.id) >= 0) {
                selected.splice(selected.indexOf(checkbox.id), 1);
            }
        }

        this.setState({selected: selected});
    }

    deleteSelected() {
        if (this.state.selected.length !== 0) {
            this.setState({status: 'Loading'});

            fetch.post('/api/jobs/delete', {ids: this.state.selected, stage: this.props.match.params.stage, type: this.state.showing})
            .then(resp => {
                let checkboxes = document.getElementsByClassName('select-message-checkbox');

                for (let checkbox of checkboxes) {
                    checkbox.checked = false;
                }

                this.setState({status: '', messages: resp.data.jobs, selected: []});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));           
            })
            .catch(err => console.log(err));
        } else {
            this.props.dispatch(Alert('error', 'Nothing to delete'));
        }
    }

    deleteMessage(id, index) {
        this.setState({status: 'Loading'});

        fetch.post('/api/jobs/delete', {ids: [id], type: this.state.showing})
        .then(resp => {
            let messages = this.state.messages;
            messages.splice(index, 1);

            this.setState({status: '', messages: messages});
            
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => console.log(err));
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
        .catch(err => console.log(err));
    }

    render() {
        console.log(this.state);
        let status, messages;

        if (this.state.status === 'Loading') {
            status = <Loading size='7x' />;
        }
        
        if (this.state.messages) {
            messages = this.state.messages.map((message, i) => {
                let pinned = false;

                if (this.state.pinnedMessages.indexOf(message.job_id) >= 0) {
                    pinned = true;
                }

                return <MessageRow key={i} user={this.props.user.user} stage={this.props.match.params.stage} message={message} select={(checkbox) => this.selectMessage(checkbox)} delete={() => this.props.dispatch(ShowConfirmation('Are you sure you want to delete this message?', false, {action: 'delete message', id: message.job_id, index: i}))} type={this.state.showing} pin={() => this.pinMessage(message.job_id)} pinned={pinned} />
            });
        }

        return(
            <section id='messages' className='blue-panel shallow three-rounded w-100'>
                {status}
                <div className='d-flex-between-center mb-5'>
                    <div className='btn-group'>
                        <button className={`btn ${this.state.showing === 'received' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'received'})}>Received</button>
                        <button className={`btn ${this.state.showing === 'sent' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'sent'})}>Sent</button>
                        <button className={`btn ${this.state.showing === 'pinned' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.setState({showing: 'pinned'})}>Pinned</button>
                    </div>

                    <div className='text-right'>
                        <NavLink to={`/dashboard/messages/${this.props.match.params.stage}`}><button className='btn btn-info btn-sm mr-1'><FontAwesomeIcon icon={faRedoAlt} /></button></NavLink>
                        <button className='btn btn-secondary btn-sm' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to delete the selected messages?', false, {action: 'delete selected'}))}><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                </div>

                <div className='d-flex-between-center mb-3'>
                    {this.state.messages.length > 0 ? <input type='checkbox' name='select-message' id='select-all-checkbox' onClick={(e) => this.selectAllMessage(e.target)} /> : ''}
                    {this.state.messages.length > 0 ? <Pagination totalItems={parseInt(this.state.messageCount)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} /> : ''}
                </div>

                {this.state.messages.length > 0 ? <hr /> : ''}

                {messages}

                {this.state.messages.length > 0 ? <hr /> : ''}

                {this.state.messages.length > 0 ? <Pagination totalItems={parseInt(this.state.messageCount)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} /> : ''}
            </section>
        )
    }
}

Messages.propTypes = {
    user: PropTypes.object.isRequired
}

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default withRouter(connect(mapStateToProps)(Messages));