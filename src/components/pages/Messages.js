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
        if (prevProps.location.key !== this.props.location.key) {
            fetch.post('/api/get/messages', {stage: this.props.match.params.stage, user: this.props.user.user.user_type})
            .then(resp => {
                this.setState({messages: resp.data.messages, status: ''});
                
                if (resp.data.status === 'error') {
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                }
            })
            .catch(err => console.log(err));
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/messages', {stage: this.props.match.params.stage, user: this.props.user.user.user_type})
        .then(resp => {
            this.setState({messages: resp.data.messages, status: ''});
 
            if (resp.data.status === 'error') {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
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

        fetch.post('/api/jobs/delete', {ids: [id]})
        .then(resp => {
            let messages = this.state.messages;
            messages.splice(index, 1);

            this.setState({status: '', messages: messages});
            
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => console.log(err));
    }

    render() {
        let status, messages;

        if (this.state.status === 'Loading') {
            status = <Loading size='7x' />;
        }

        console.log(status)
        
        if (this.state.messages) {
            messages = this.state.messages.map((message, i) => {
                return <MessageRow key={i} user={this.props.user.user} stage={this.props.match.params.stage} message={message} select={(checkbox) => this.selectMessage(checkbox)} delete={() => this.props.dispatch(ShowConfirmation('Are you sure you want to delete this message?', false, {action: 'delete message', id: message.job_id, index: i}))} />
            });
        }

        return(
            <section id='messages' className='blue-panel shallow three-rounded w-100'>
                {status}
                <div className='user-message-header mb-3'>
                    <div className='w-5'><input type='checkbox' name='select-message' id='select-all-checkbox' onClick={(e) => this.selectAllMessage(e.target)} /></div>
                    <div className='w-5'></div>
                    <div className='w-60'></div>
                    <div className='w-20 text-right'>
                        <NavLink to={`/dashboard/messages/${this.props.match.params.stage}`}><button className='btn btn-info btn-sm mr-1'><FontAwesomeIcon icon={faRedoAlt} /></button></NavLink>
                        <button className='btn btn-secondary btn-sm' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to delete the selected messages?', false, {action: 'delete selected'}))}><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                </div>

                <hr/>
                {messages}
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