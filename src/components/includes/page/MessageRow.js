import React, { Component } from 'react';
import moment from 'moment';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import UserProfilePic from './UserProfilePic';
import Username from './Username';

class MessageRow extends Component {
    render() {
        return(
            <React.Fragment>
                {this.props.author !== 'system' ? <div className={`message-row-username ${this.props.author === 'owner' ? 'right' : 'left'}`}><Username username={this.props.message.message_sender} color='highlight' right={this.props.author === 'owner'} /></div> : ''}

                <div className={`message-row ${this.props.author}`}>
                    {this.props.message.message_sender != 'System' ? <div className='message-row-profile-pic'><UserProfilePic url={this.props.message.avatar_url} /></div> : ''}
                    <div className='message-container'>
                        <div className={`message-row-body ${this.props.type}`}>
                            {this.props.message.message_status === 'New' && this.props.message.message_recipient === this.props.user.user.username ? <span className='new-message-status mini-badge mini-badge-success'>{this.props.message.message_status}</span> : ''}
                            {this.props.message.message_body}
    
                            {this.props.type === 'confirmation' || this.props.type === 'abandonment' ? <div className='message-row-buttons'><button className='btn btn-success' onClick={() => this.props.approve()}>Approve</button><button className='btn btn-danger' onClick={() => this.props.decline()}>Decline</button></div> : ''}
                        </div>
        
                        <div className={`message-row-footer ${this.props.author}`}>
                            {this.props.message.message_sender === 'System' || this.props.message.message_sender === this.props.user.user.username ? 'Sent' : 'Received'} {moment(this.props.message.message_date).fromNow()}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        prompt: state.Prompt,
        user: state.Login
    }
}

export default connect(mapStateToProps)(MessageRow);