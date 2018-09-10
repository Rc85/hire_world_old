import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import fetch from 'axios';
import Loading from '../utils/Loading';
import PropTypes from 'prop-types';
import moment from 'moment';
import Alert from '../utils/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ShowConfirmation, ResetConfirmation } from '../../actions/ConfirmationActions';
import { connect } from 'react-redux';

class Messages extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            messages: null,
            status: 'Loading',
            statusMessage: '',
            selected: []
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
    
    componentDidUpdate(prevProps) {
        if (prevProps.match.params.stage !== this.props.match.params.stage) {
            fetch.post('/api/get/messages', {stage: this.props.match.params.stage, user: this.props.user.user.user_type})
            .then(resp => {
                console.log(resp);
                if (resp.data.status === 'success') {
                    this.setState({messages: resp.data.messages, status: ''});
                } else {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => console.log(err));
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/messages', {stage: this.props.match.params.stage, user: this.props.user.user.user_type})
        .then(resp => {
            console.log(resp);
            if (resp.data.status === 'success') {
                this.setState({messages: resp.data.messages, status: ''});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

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

            fetch.post('/api/jobs/delete', {ids: this.state.selected, stage: this.props.match.params.stage})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let checkboxes = document.getElementsByClassName('select-message-checkbox');

                    for (let checkbox of checkboxes) {
                        checkbox.checked = false;
                    }

                    this.setState({status: '', messages: resp.data.jobs, selected: []});
                } else {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => console.log(err));
        } else {
            this.setState({status: 'error', statusMessage: 'Nothing to delete'});
        }
    }

    deleteMessage(id, index) {
        this.setState({status: 'Loading'});

        fetch.post('/api/jobs/delete', {id: id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let messages = this.state.messages;
                messages.splice(index, 1);

                this.setState({messages: messages});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
    }

    render() {
        console.log(this.props)
        let status, messages;

        if (this.state.status === 'Loading') {
            status = <Loading size='7x' />;
        } else if (this.state.status && this.state.status !== 'Loading') {
            status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />;
        }
        
        if (this.state.messages) {
            messages = this.state.messages.map((message, i) => {
                return <div key={i} className='user-message mb-3'>
                    <div className='w-5'><input type='checkbox' name='select-message' id={message.job_id} className='select-message-checkbox' onChange={(e) => this.selectMessage(e.target)}/></div>
                    <div className='w-5'>{message.job_id}</div>
                    <div className='user-message-subject w-40'><NavLink to={`/dashboard/message/${this.props.match.params.stage}/${message.job_id}/details`}>{message.job_subject}</NavLink> {message.job_user === this.props.user.user.username && message.job_status === 'New' ? <span className='badge badge-success'>{message.job_status}</span> : ''}</div>
                    <div className='w-20'>{moment(message.message_date).fromNow()}</div>
                    <div className='w-20'>{this.props.user.user.user_type === 'User' ? message.message_sender : message.message_recipient}</div>
                    <div className='w-5'>{message.job_status === 'Closed' || message.job_status === 'Declined' ? <div className='badge badge-danger'>{message.job_status}</div> : ''}</div>
                    <div className='w-5 text-right'><button className='btn btn-secondary btn-sm' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to delete this message?', false, {action: 'delete message', id: message.job_id, index: i}))}><FontAwesomeIcon icon={faTrash} /></button></div>
                </div>
            });
        }

        return(
            <div className='blue-panel shallow three-rounded w-100'>
                {status}
                <div className='user-message-header mb-3'>
                    <div className='w-5'><input type='checkbox' name='select-message' id='select-all-checkbox' onClick={(e) => this.selectAllMessage(e.target)} /></div>
                    <div className='w-5'>ID</div>
                    <div className='w-40'>Subject</div>
                    <div className='w-20'>Last Message</div>
                    <div className='w-20'>{this.props.user.user.user_type === 'User' ? 'From' : 'To'}</div>
                    <div className='w-5'></div>
                    <div className='w-5 text-right'>
                        <button className='btn btn-secondary btn-sm' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to delete the selected messages?', false, {action: 'delete selected'}))}><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                </div>

                <hr/>
                {messages}
            </div>
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