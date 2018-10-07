import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import AddService from '../includes/page/AddService';
import Service from '../includes/page/Service';
import fetch from 'axios';
import Alert from '../utils/Alert';
import PropTypes from 'prop-types';

class UserServices extends Component {
    constructor(props) {
        super(props);

        this.state = {
            forms: [],
            services: [],
            status: '',
            statusMessage: '',
            addService: false
        }
    }

    componentDidMount() {
        this.setState({status: 'Loading'});

        fetch.get('/api/get/services')
        .then(resp => {
            if (resp.data.status === 'get services success') {
                this.setState({
                    services: resp.data.services,
                    status: ''
                })
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        });
    }

    addService(data) {
        this.setState({status: 'Loading'});

        fetch.post('/api/user/services/add', data)
        .then(resp => {
            if (resp.data.status === 'success') {
                let services = this.state.services;
                services.push(resp.data.service);

                this.setState({services: services, status: '', statusMessage: '', addService: false});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    deleteService(id, index) {
        this.setState({status: 'Loading'});

        fetch.post('/api/user/services/delete', {id: id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let services = this.state.services;
                services.splice(index, 1);

                this.setState({services: services, status: ''});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    editService(data, index) {
        this.setState({status: 'Loading'});

        fetch.post('/api/user/services/edit', data)
        .then(resp => {
            if (resp.data.status === 'success') {
                let services = this.state.services;
                services[index] = resp.data.service;

                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage, services: services})
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        let status, button, addServiceForm;
        
        if (this.state.status && this.state.status !== 'Loading') {
            status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />
        }

        let services = this.state.services.map((service, i) => {
            return <Service key={i} id={service.service_id} service={service} deleteService={(id) => this.deleteService(id, i)} edit={(data) => this.editService(data, i)} />
        });

        if (this.state.services.length < this.props.user.user.services_allowed) {
            if (!this.state.addService) {
                button = <button className='btn btn-info btn-sm' onClick={() => this.setState({addService: true})}><FontAwesomeIcon icon={faPlus} /></button>;
            } else {
                addServiceForm = <AddService user={this.props.user} add={(data) => this.addService(data)} remove={() => this.setState({addService: false})} />;
            }
        }

        return(
            <section id='user-services' className='blue-panel shallow three-rounded'>
                <div className='d-flex justify-content-between mb-3'>
                    <h5>Listings</h5>

                    {button}
                </div>

                <div id='add-service-container mb-3'>
                    {addServiceForm}
                </div>

                <div className='services-list'>
                    {status}
                    {services}
                </div>
            </section>
        )
    }
}

UserServices.propTypes = {
    user: PropTypes.object.isRequired
}

export default withRouter(connect()(UserServices));