import React, { Component } from 'react';
import '../styles/UserServices.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import AddService from './AddService';
import Loading from './Loading';
import Service from './Service';

let formsCount = 0;

class UserServices extends Component {
    constructor(props) {
        super(props);

        this.state = {
            forms: []
        }
    }

    addServiceForm() {
        let forms = this.state.forms;
        forms.push(<AddService callback={this.removeServiceForm.bind(this)} />);

        this.setState({
            forms: forms
        });
    }

    removeServiceForm() {
        let forms = this.state.forms;
        forms.splice(0, 1);

        console.log(forms);

        this.setState({
            forms: forms
        });
    }

    render() {
        let services = [];
        let loading;
        let forms = this.state.forms.map((form, i) => {
            return <div key={i}>
                {form}
            </div>
        });

        if (this.props.status === 'add service loading') {
            loading = <Loading size='4x' />
        }

        if (this.props.services) {
            for (let obj of this.props.services) {
                let service = <Service key={obj.service_id} id={obj.service_id} name={obj.service_name} desc={obj.service_description} />

                services.push(service);
            }
        }

        formsCount = services.length + forms.length;

        return(
            <section id='user-services'>
                <div className='d-flex justify-content-between mb-2'>
                    <h6>Services</h6>

                    {formsCount < 3 ? <button className='btn btn-info btn-sm' onClick={this.addServiceForm.bind(this)}><FontAwesomeIcon icon={faPlus} /></button> : '' }
                </div>

                <div id='add-service-container'>
                    {loading}
                    {forms}
                    {services}
                </div>
            </section>
        )
    }
}

const mapStateToProps = state => {
    return {
        status: state.Services.status,
        services: state.Services.services
    }
}

export default withRouter(connect(mapStateToProps)(UserServices));