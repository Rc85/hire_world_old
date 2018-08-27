import React, { Component } from 'react';
import '../../../styles/UserServices.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import AddService from './AddService';
import Loading from '../../utils/Loading';
import Service from './Service';
import Alert from '../../utils/Alert';

class UserServices extends Component {
    constructor(props) {
        super(props);

        this.state = {
            forms: []
        }
    }

    addServiceForm() {
        if (this.state.forms.length < 1) {
            let forms = this.state.forms;
            forms.push(<AddService callback={this.removeServiceForm.bind(this)} />);

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

    render() {
        let forms = this.state.forms.map((form, i) => {
            return <div key={i}>
                {form}
            </div>
        });
        let services, loading, error, button;
        //let errorCheck = /error$|fail$/;

        if (this.props.status === 'add service loading') {
            loading = <Loading size='4x' />
        }
        
        /* if (errorCheck.test(this.props.status)) {
            error = <Alert status='error' />
        } */

        if (this.props.services) {
            services = this.props.services.map((service, i) => {
                return <Service key={i} id={service.service_id} service={service} />
            });
        }

        if (this.props.services) {
            if (this.props.services.length < this.props.user.services_allowed) {
                if (this.state.forms.length < 1) {
                    button = <button className='btn btn-info btn-sm' onClick={this.addServiceForm.bind(this)}><FontAwesomeIcon icon={faPlus} /></button>
                } else {
                    button = <button className='btn btn-danger btn-sm' onClick={this.removeServiceForm.bind(this)}><FontAwesomeIcon icon={faTimes} /></button>
                }
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
                    {loading}
                    {services}
                </div>
            </section>
        )
    }
}

const mapStateToProps = state => {
    return {
        status: state.Services.status,
        services: state.Services.services,
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(UserServices));