import React, { Component } from 'react';
import { withRouter, NavLink } from 'react-router-dom';
import Loading from '../utils/Loading';
import fetch from 'axios';
import Response from '../pages/Response';

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
            this.setState({
                service: resp.data.service,
                status: resp.data.status,
                statusMessage: resp.data.statusMessage
            });
        })
        .catch(err => console.log(err));
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
    
                <div className='service-inquire'>
                    <textarea name='inquiry' className='form-control w-100 mb-1' rows='10' placeholder='Describe briefly what you need regarding this service'></textarea>
    
                    <div className='text-right'>
                        <button className='btn btn-primary'>Submit</button>
                    </div>
                </div>
            </div>
        }

        if (this.state.status === 'error') {
            return(
                <Response header='An Error Occurred' message={this.state.statusMessage} />
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
                                <NavLink to='/sectors/Artists' className='ml-1'><span className='badge badge-light'>{this.state.service.service_listed_under}</span></NavLink>
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
                                <h5>Service Provider</h5>

                                <div className='mb-3'>
                                    <NavLink to={`/user/${this.state.service.service_provided_by}`}>{this.state.service.service_provided_by}</NavLink>
                                </div>
                                
                                <h5>Service Location</h5>

                                <div className='mb-3'>
                                    {location}
                                </div>

                                {inquire}
                            </div>
                        </div>

                        <div className='service-footer'>
                            <small>Save | Report</small>
                        </div>
                    </div>
                </section>
            )
        }
    }
}

export default withRouter(ServiceDetails);