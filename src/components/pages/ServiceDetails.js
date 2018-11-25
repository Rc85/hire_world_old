import React, { Component } from 'react';
import { withRouter, NavLink } from 'react-router-dom';
import Loading from '../utils/Loading';
import fetch from 'axios';
import Response from '../pages/Response';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHeart } from '@fortawesome/free-solid-svg-icons';
import MessageSender from '../includes/page/MessageSender';
import { LogError } from '../utils/LogError';

class ServiceDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            service: null,
            status: 'Loading',
            statusMessage: ''
        }
    }

    componentDidMount() {
        fetch.post('/api/get/service/detail', {id: this.props.match.params.id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', service: resp.data.service});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => LogError(err, '/api/get/service/detail'));
    }

    send(message, subject) {
        this.setState({status: 'Sending'});

        fetch.post('/api/message/submit', {subject: subject, message: message, service: this.state.service})
        .then(resp => {
            this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
        })
        .catch(err => LogError(err, '/api/message/submit'));
    }

    render() {
        let location, inquire;

        if (this.state.service) {
            if (this.state.service.service_worldwide) {
                location = <div>World-wide/Online</div>
            } else {
                location = <div>
                    {this.state.service.service_region || this.state.service.service_city ? this.state.service.service_country + ', ' : this.state.service.service_country}
                    {this.state.service.service_city ? this.state.service.service_region + ', ' : this.state.service.service_region}
                    {this.state.service.service_city}
                </div>
            }
        }

        if (this.props.user) {
            inquire = <div>
                <h5>Inquire</h5>
    
                <MessageSender send={(message, subject) => this.send(message, subject)} status={this.state.status} statusMessage={this.state.statusMessage} />
            </div>
        }

        if (this.state.status === 'error') {
            return(
                <Response code={500} header='Internal Server Error' message={this.state.statusMessage} />
            )
        } else if (this.state.status === 'Loading') {
            return(
                <Loading size='7x' />
            )
        } else {
            return(
                <section id='service-details' className='main-panel w-100'>
                    <div className='blue-panel shallow rounded w-100 position-relative'>
                        <div className='service-details-header'>
                            <div className='d-inline-flex'>
                                <h2>{this.state.service.service_name}</h2>
                            </div>
                            
                            <span>Renewed {this.state.service.service_created_on}</span>
                        </div>

                        <hr/>

                        <div className='row'>
                            <div className='col-8'>
                                <div className='grey-panel rounded'>
                                    {this.state.service.service_detail}
                                </div>
                            </div>

                            <div className='col-4'>
                                <h5>Listing Owner</h5>

                                <div className='mb-3'>
                                    <NavLink to={`/user/${this.state.service.service_provided_by}`}>{this.state.service.service_provided_by}</NavLink>
                                </div>
                                
                                <h5>Listing Location</h5>

                                <div className='mb-3'>
                                    {location}
                                </div>

                                <h5>Listed Under</h5>

                                <div className='mb-3'><NavLink to='/sectors/Artists' className='ml-1'>{this.state.service.service_listed_under}</NavLink></div>

                                {inquire}
                            </div>
                        </div>

                        <div className='service-footer'>
                            <FontAwesomeIcon icon={faHeart} size='sm' /> <FontAwesomeIcon icon={faExclamationTriangle} size='sm' />
                        </div>
                    </div>
                </section>
            )
        }
    }
}

export default withRouter(ServiceDetails);