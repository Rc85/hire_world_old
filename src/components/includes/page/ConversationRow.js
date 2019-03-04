import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack, faGavel, faEllipsisH, faCheck, faCaretRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { PromptOpen, PromptReset } from '../../../actions/PromptActions';
import { connect } from 'react-redux';
import ReviewButton from '../../utils/ReviewButton';
import SubmitReview from './SubmitReview';
import Username from './Username';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';

class ConversationRow extends Component {
    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data) {
            if (nextProps.confirm.data.action === 'delete conversation' && nextProps.confirm.option && nextProps.confirm.data.id === this.props.message.conversation_id) {
                this.props.delete(this.props.message.conversation_id);
                this.props.dispatch(ResetConfirmation());
            }
        }
    }
    
    render() {
        let statusButton, pinnedButton, appealButton, review;
        
        if (this.props.pinned) {
            pinnedButton = <button className='btn btn-yellow btn-sm' onClick={() => this.props.pin()}><FontAwesomeIcon icon={faThumbtack} /></button>
        } else {
            pinnedButton = <button className='btn btn-grey btn-sm' onClick={() => this.props.pin()}><FontAwesomeIcon icon={faThumbtack} /></button>
        }
        
        if (this.props.user) {
            if (this.props.user.username === this.props.message.conversation_recipient) {
                if (this.props.message.conversation_status === 'New') {
                    statusButton = <span className='mini-badge mini-badge-success mr-1'>{this.props.message.conversation_status}</span>;
                } else if (this.props.message.conversation_status === 'Abandoning') {
                    statusButton = <span className = 'mini-badge mini-badge-warning mr-1'>{this.props.message.conversation_status}</span>;
                }
            }
        }

        return (
            <div className='inquiry-row'>
                <div className='inquiry-main-row' title={this.props.message.conversation_subject}>
                    <div className={`inquiry-row-text-wrapper ${this.props.loadedId === this.props.message.conversation_id ? 'active' : ''}`} onClick={() => this.props.load(this.props.message.conversation_id)}>
                        {statusButton}

                        {this.props.message.conversation_subject}
                    </div>

                    <div className='inquiry-row-buttons'>{pinnedButton} <button className='btn btn-danger btn-sm' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to delete this message?', false, {action: 'delete conversation', id: this.props.message.conversation_id}))}><FontAwesomeIcon icon={faTrash} /></button></div>
                </div>

                <div className='inquiry-detail-row'>
                    <div className='d-flex'>
                        {this.props.message.unread_messages > 0 ? <div className={`inquiry-detail-type-indicator`}>{this.props.message.unread_messages}</div> : ''}
    
                        <div className='inquiry-detail-type'>
                            {this.props.user && this.props.message.conversation_starter === this.props.user.username ? 
                            
                            <span>To <Username username={this.props.message.conversation_recipient} color='highlight' /> {moment(this.props.message.conversation_date).fromNow()}</span> : 
                            
                            <span>From <Username username={this.props.message.conversation_starter} color='highlight' /> {moment(this.props.message.conversation_date).fromNow()}</span>}
                        </div>
                    </div>

                    <div className='inquiry-row-id'>Message ID: {this.props.message.conversation_id}</div>
                </div>

                {this.props.loadedId === this.props.message.conversation_id ? <FontAwesomeIcon icon={faCaretRight} size='3x' className='message-active-arrow' /> : ''}
            </div>
        );
    }
}

ConversationRow.propTypes = {
    user: PropTypes.object,
    message: PropTypes.object,
    pin: PropTypes.func,
    pinned: PropTypes.bool
};

const mapStateToProps = state => {
    return {
        prompt: state.Prompt,
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(ConversationRow);