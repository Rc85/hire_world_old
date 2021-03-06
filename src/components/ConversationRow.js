import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack, faCaretRight, faTrash, faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
import { connect } from 'react-redux';
import Username from './Username';
import { ShowConfirmation, ResetConfirmation } from '../actions/ConfirmationActions';

class ConversationRow extends Component {
    componentDidUpdate(prevProps, prevState) {
        if (this.props.confirm.data) {
            if (this.props.confirm.data.action === 'delete conversation' && this.props.confirm.option && this.props.confirm.data.id === this.props.message.conversation_id) {
                this.props.delete(this.props.message.conversation_id);
                this.props.dispatch(ResetConfirmation());
            }
        }
    }
    
    render() {
        let statusButton, pinnedButton, appealButton, review;
        
        if (this.props.status === `Pinning ${this.props.message.conversation_id}`) {
            pinnedButton = <button className='btn btn-grey btn-sm'><FontAwesomeIcon icon={faCircleNotch} spin /></button>;
        } else {
            if (this.props.pinned) {
                pinnedButton = <button className='btn btn-yellow btn-sm' onClick={() => this.props.pin()}><FontAwesomeIcon icon={faThumbtack} /></button>
            } else {
                pinnedButton = <button className='btn btn-grey btn-sm' onClick={() => this.props.pin()}><FontAwesomeIcon icon={faThumbtack} /></button>
            }
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
                <div className='inquiry-main-row'>
                    <div className={`inquiry-row-text-wrapper ${this.props.loadedId === this.props.message.conversation_id ? 'active' : ''}`} onClick={() => this.props.load(this.props.message.conversation_id)} title={this.props.message.conversation_subject}>
                        {statusButton}

                        {this.props.message.conversation_subject}
                    </div>

                    <div className='inquiry-row-buttons'>{pinnedButton} <button className='btn btn-danger btn-sm' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to delete this conversation?', false, {action: 'delete conversation', id: this.props.message.conversation_id}))}><FontAwesomeIcon icon={faTrash} /></button></div>
                </div>

                <div className='inquiry-detail-row'>
                    <div className='d-flex'>
                        {this.props.message.unread_messages > 0 ? <div className={`inquiry-detail-type-indicator`}>{this.props.message.unread_messages}</div> : ''}
    
                        <div className='inquiry-detail-type'>
                            {this.props.user && this.props.message.conversation_starter === this.props.user.username ? 
                            
                            <React.Fragment>With <Username username={this.props.message.conversation_recipient} color='highlight' className='ml-1 mr-1' /><span className='hide-on-mobile'></span></React.Fragment> : 
                            
                            <React.Fragment>With <Username username={this.props.message.conversation_starter} color='highlight' className='ml-1 mr-1' /><span className='hide-on-mobile'></span></React.Fragment>}
                        </div>
                    </div>

                    <div className='inquiry-row-id'><span className='hide-on-mobile'>Message </span>ID: {this.props.message.conversation_id}</div>
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