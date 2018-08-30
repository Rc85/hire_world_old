import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import AddService from './AddService';
import Loading from '../../utils/Loading';
import Service from './Service';
import fetch from 'axios';
import Alert from '../../utils/Alert';

class UserServices extends Component {
    constructor(props) {
        super(props);

        this.state = {
            forms: [],
            services: [],
            status: '',
            statusMessage: ''
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

    addServiceForm() {
        if (this.state.forms.length < 1) {
            let forms = this.state.forms;
            forms.push(<AddService add={(data) => this.addService(data)} remove={this.removeServiceForm.bind(this)} />);

            this.setState({
                forms: forms
            });
        }
    }

    removeServiceForm() {
        let forms = this.state.forms;
        forms.splice(0, 1);

        this.setState({
            forms: forms
        });
    }

    addService(data) {
        this.setState({status: 'Loading'});

        fetch.post('/api/user/services/add', data)
        .then(resp => {
            if (resp.data.status === 'success') {
                let forms = this.state.forms;
                forms.splice(0, 1);

                this.setState({
                    services: resp.data.services,
                    status: '',
                    forms: forms
                });
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    deleteService(id) {
        this.setState({status: 'Loading'});

        fetch.post('/api/user/services/delete', {id: id})
        .then(resp => {
            console.log(resp);
            if (resp.data.status === 'success') {
                this.setState({
                    services: resp.data.services,
                    status: ''
                });
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    editService(data) {
        this.setState({status: 'Loading'});

        fetch.post('/api/user/services/edit', data)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({
                    services: resp.data.services,
                    status: ''
                })
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        let forms = this.state.forms.map((form, i) => {
            return <div key={i}>
                {form}
            </div>
        });
        let status, button;

        if (this.state.status && this.state.status !== 'Loading') {
            status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />
        }

        let services = this.state.services.map((service, i) => {
            return <Service key={i} id={service.service_id} service={service} deleteService={(id) => this.deleteService(id)} edit={(data) => this.editService(data)} />
        });

        if (this.state.services.length < this.props.user.services_allowed) {
            if (this.state.forms.length < 1) {
                button = <button className='btn btn-info btn-sm' onClick={this.addServiceForm.bind(this)}><FontAwesomeIcon icon={faPlus} /></button>
            } else {
                button = <button className='btn btn-secondary btn-sm' onClick={this.removeServiceForm.bind(this)}><strong>Cancel</strong></button>
            }
        }

        return(
            <section id='user-services'>
                <div className='d-flex justify-content-between mb-3'>
                    <h6>Services</h6>

                    {button}
                </div>

                <div id='add-service-container mb-3'>
                    {forms}
                </div>

                <div className='services-list'>
                    {status}
                    {services}
                </div>
            </section>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(UserServices));