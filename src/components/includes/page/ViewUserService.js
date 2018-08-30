import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SubmitButton from '../../utils/SubmitButton';
import fetch from 'axios';
import Alert from '../../utils/Alert';
import { connect } from 'react-redux';
import Loading from '../../utils/Loading';

class ViewUserService extends Component {
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
            <div className='view-user-service card mb-3'>
                {status}
                <div className='card-header'>
                    <div className='view-user-service-header'>
                        <h4>{this.props.service.service_name}</h4>
                        <div className='d-flex'>
                            <a href={`/sectors/${this.props.service.service_listed_under}`}><div className='badge badge-dark'>{this.props.service.service_listed_under}</div></a>
                        </div>
                    </div>

                    <span>{this.props.service.service_worldwide}{this.props.service.service_region || this.props.service.service_city ? this.props.service.service_country + ', ' : this.props.service.service_country } {this.props.service.service_city ? this.props.service.service_region + ', ' : this.props.service.service_region} {this.props.service.service_city}</span>
                </div>

                <div className='card-body'>
                    <div className='mb-3'>{this.props.service.service_detail}</div>
                    {inquire}
                </div>

                <div className='card-footer view-user-service-footer'>
                    <div>{button}</div>

                    <small>Renewed {this.props.service.service_created_on}</small>
                </div>
            </div>
        );
    }
}

ViewUserService.propTypes = {
    service: PropTypes.object
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default connect(mapStateToProps)(ViewUserService);