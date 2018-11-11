import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';
import { NavLink } from 'react-router-dom';

class UserMessage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editing: false,
            message: this.props.message.message_body,
            status: '',
            statusMessage: ''
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data && nextProps.confirm.data.action === 'delete message') {
            if (nextProps.confirm.data.id === this.props.message.message_id && nextProps.confirm.option) {
                this.props.delete();
                this.props.dispatch(ResetConfirmation());
            }
        }
    }

    editMessage() {
        let blankCheck = /^\s*$/;

        if (blankCheck.test(this.state.message)) {
            this.setState({status: 'error', statusMessage: 'Message cannot be blank'});
        } else {
            this.props.edit(this.state.message);
            this.setState({editing: false});
        }
    }
    
    render() {
        let messageOptions = <div></div>;
        let editButton, deleteButton, messageStatus;
        let messageBody = this.props.message.message_body;

        if (this.props.job.job_stage !== 'Complete') {
            editButton = <button className='btn btn-info btn-sm mr-1' onClick={() => this.setState({editing: true})}><FontAwesomeIcon icon={faEdit} /></button>;

            if (this.props.message.is_reply) {
                deleteButton = <button className='btn btn-danger btn-sm' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to delete this message?', 'This action cannot be reverted', {action: 'delete message', id: this.props.message.message_id}))}><FontAwesomeIcon icon={faTrash} /></button>;
            }
        }

        if (this.props.user.username === this.props.message.message_sender) {
            messageOptions = <div className='d-flex'>
                {editButton}
                {deleteButton}
            </div>
        }

        if (this.props.user.username === this.props.message.message_recipient && this.props.message.message_status === 'New') {
            messageStatus = <h4><span className='badge badge-success mr-3'>New</span></h4>
        }

        if (this.state.editing) {
            editButton = '';
            messageBody = <div>
                <textarea name='message' rows='6' className='form-control w-100 keep-format mb-3' defaultValue={this.props.message.message_body} onChange={(e) => this.setState({message: e.target.value})}></textarea>
                <div className='text-right'>
                    <button className='btn btn-primary mr-1' onClick={() => this.editMessage()}>Save</button>
                    <button className='btn btn-secondary' onClick={() => this.setState({editing: false})}>Cancel</button>
                </div>
            </div>
        }

        return(
            <div className={`${this.props.rowClass} mb-3`}>
                <div className='col-2'>
                    <div className={`profile-pic w-75 ${this.props.profilePicAlignment}`} style={{background: `url(${this.props.message.avatar_url}) center top / cover`}}></div>
                    <div className={`w-75 text-center ${this.props.profilePicAlignment}`}><NavLink to={`/user/${this.props.message.message_sender}`}>{this.props.message.message_sender}</NavLink></div>
                    <div></div>
                </div>
                <div className='col-10'>
                    <div className={this.props.panelClass}>
                        <div className='d-flex-between-start mb-3'>
                            <small>{this.props.text} {moment(this.props.message.message_date).fromNow()} {this.props.message.message_modified_date ? `(Edited ${moment(this.props.message.message_modified_date).fromNow()})` : ''}</small>
                            <div>
                                {messageOptions}
                                {messageStatus}
                            </div>
                        </div>
                        <div className='mb-3'>{messageBody}</div>
                        <div className='text-right'><small className='text-muted'>Message ID: {this.props.message.message_id}</small></div>
                    </div>
                </div>
            </div>
        )
    }
}

UserMessage.propTypes = {
    rowClass: PropTypes.string,
    panelClass: PropTypes.string,
    text: PropTypes.string,
    profilePicAlignment: PropTypes.oneOf(['ml-auto', 'mr-auto']),
    message: PropTypes.shape({
        avatar_url: PropTypes.string,
        belongs_to_job: PropTypes.number,
        is_reply: PropTypes.bool,
        job_stage: PropTypes.string,
        message_body: PropTypes.string,
        message_date: PropTypes.string,
        message_recipient: PropTypes.string,
        message_sender: PropTypes.string,
        message_status: PropTypes.string,
        message_type: PropTypes.string
    }),
    user: PropTypes.object,
    delete: PropTypes.func,
    edit: PropTypes.func,
    job: PropTypes.object
}

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(UserMessage);