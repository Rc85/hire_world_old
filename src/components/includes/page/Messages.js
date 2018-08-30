import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import fetch from 'axios';
import Loading from '../../utils/Loading';

class Messages extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            messages: null,
            status: 'Loading',
            statusMessage: ''
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/messages', {stage: 'Inquire', user: this.props.user.user_type})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({messages: resp.data.messages, status: ''});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        let status, messages;

        if (this.state.status === 'Loading') {
            status = <Loading size='7x' />;
        } else if (this.state.status === 'error') {
            status = <div className='alert alert-danger mx-auto'>{this.state.statusMessage}</div>;
        }
        
        if (this.state.messages) {
            messages = this.state.messages.map((message, i) => {
                return <div key={i} className='user-message mb-3'>
                    <div className='w-5'>{message.job_id}</div>
                    <div className='user-message-subject w-45'><NavLink to={`/dashboard/message/${message.message_id}/details`}>{message.message_subject}</NavLink></div>
                    <div className='w-20'>{message.message_date}</div>
                    <div className='w-25'>{this.props.user.user_type === 'User' ? message.message_sender : message.message_recipient}</div>
                    <div className='w-5 text-right'>{message.job_user === this.props.user.username ? <span className='badge badge-success'>{message.new_message_status}</span> : ''}</div>
                </div>
            });
        }

        return(
            <div className='blue-panel shallow three-rounded w-100'>
                {status}
                <div className='user-message-header mb-3'>
                    <div className='w-5'>ID</div>
                    <div className='w-45'>Subject</div>
                    <div className='w-20'>Last Message</div>
                    <div className='w-25'>{this.props.user.user_type === 'User' ? 'From' : 'To'}</div>
                    <div className='w-5'></div>
                </div>

                <hr/>
                {messages}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default connect(mapStateToProps)(Messages);