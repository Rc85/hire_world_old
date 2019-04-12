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
                <div className={`message-row-username ${this.props.author === 'owner' ? 'left' : 'right'}`}><Username username={this.props.message.message_creator} color='highlight' right={this.props.author === 'owner'} /></div>

                <div className={`message-row ${this.props.author}`}>
                    <div className='message-row-profile-pic'><UserProfilePic url={this.props.message.avatar_url} /></div>
                    <div className='message-container'>
                        <div className={`message-row-body ${this.props.type}`}>
                            {this.props.message.message_status === 'New' && this.props.message.message_creator !== this.props.user.user.username ? <span className='new-message-status mini-badge mini-badge-success'>{this.props.message.message_status}</span> : ''}
                            {this.props.message.message_body}

                            <div className='text-right'><small className='text-dark'>Message ID: {this.props.message.message_id}</small></div>
                        </div>
        
                        <div className={`message-row-footer ${this.props.author}`}>
                            <small>{this.props.message.message_creator === this.props.user.user.username ? 'Sent' : 'Received'} {moment(this.props.message.message_date).fromNow()}</small>
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