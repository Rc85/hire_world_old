import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SubmitButton from '../../utils/SubmitButton';
import fetch from 'axios';
import Alert from '../../utils/Alert';
import Loading from '../../utils/Loading';
import { NavLink } from 'react-router-dom';

export default class ViewUserService extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            inquire: false,
            subject: '',
            message: '',
            status: '',
            statusMessage: ''
        }
    }

    send() {
        this.setState({status: 'Sending'});

        fetch.post('/api/message/submit', {subject: this.state.subject, message: this.state.message, service: this.props.service})
        .then(resp => {
            console.log(resp);
            if (resp.data.status === 'success') {
                this.setState({
                    inquire: false,
                    status: resp.data.status,
                    statusMessage: resp.data.statusMessage
                });
            } else {
                this.setState({
                    status: resp.data.status,
                    statusMessage: resp.data.statusMessage
                });
            }
        })
        .catch(err => console.log(err));
    }
    
    render() {
        console.log(this.props.user)
        let inquire, button, status;

        if (this.state.status) {
            if (this.state.status !== 'Sending') {
                status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />;
            } else {
                status = <Loading size='3x' />;
            }
        }

        if (this.state.inquire && this.props.user && this.props.user.user_type === 'Client') {
            inquire = <div className='view-user-inquire'>
                <hr/>
                <div className='mb-3'>
                    <label>Subject:</label>
                    <input type='text' name='subject' className='form-control' onChange={(e) => this.setState({subject: e.target.value})} placeholder={`eg. - 'Looking for...', 'Need (something) done', etc.`} />
                </div>

                <div className='mb-3'>
                    Questions/Comments:
                    <textarea name='inquire' rows='10' className='form-control w-100' onChange={(e) => this.setState({message: e.target.value})}></textarea>
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Submit' loading={this.state.status === 'Sending' ? true : false} onClick={() => {this.send()}} />
                    <button className='btn btn-secondary' onClick={() => this.setState({inquire: !this.state.inquire})}>Cancel</button>
                </div>
            </div>;
        } else if (!this.state.inquire && this.props.user && this.props.user.user_type === 'Client') {
            button = <button className='btn btn-info btn-sm' onClick={() => this.setState({inquire: !this.state.inquire})}>Inquire</button>;
        }

        return (
            <div className='view-user-service grey-panel rounded mb-3'>
                {status}
                <div className='d-flex-between-center'>
                    <NavLink to={`/service/${this.props.service.service_id}`}>{this.props.service.service_name}</NavLink>

                    <small>Renewed {this.props.service.service_created_on}</small>
                </div>
            </div>
        );
    }
}

ViewUserService.propTypes = {
    service: PropTypes.object
}