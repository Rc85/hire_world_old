import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';
import SlideToggle from '../../utils/SlideToggle';
import Alert from '../../utils/Alert';
import ServiceForm from './ServiceForm';
import PropTypes from 'prop-types';
import Loading from '../../utils/Loading';
import fetch from 'axios';
import { NavLink } from 'react-router-dom';

class Service extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editing: false,
            status: '',
            statusMessage: '',
            available: this.props.service.service_status,
            tooltipOpen: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data && nextProps.data.action === 'delete service') {
            if (nextProps.delete && this.props.delete !== nextProps.delete) {
                if (this.props.id === nextProps.data.id) {
                    this.deleteService();
                    this.props.dispatch(ResetConfirmation());
                }
            }
        }

        if (nextProps.status) {
            this.setState({status: nextProps.status});
        }
    }

    componentDidMount() {
        this.setState({
            title: this.props.name,
            description: this.props.desc
        });
    }

    confirmDelete() {
        this.props.dispatch(ShowConfirmation('Are you sure you want to delete this service?', 'This action cannot be reversed nor will you be refunded.', {id: this.props.id, action: 'delete service'}));
        document.body.style.overflowY = 'hidden';
    }

    deleteService() {
        this.props.deleteService(this.props.id);
    }

    editService(data) {
        let blankCheck = /^\s*$/;
        let cityCheck = /^[a-zA-Z]*$/;
        data['id'] = this.props.id;

        if ((blankCheck.test(data.service_name) || !data.service_name) || !data.service_listed_under || (!data.service_worldwide && blankCheck.test(data.service_country))) {
            this.setState({status: 'error', statusMessage: 'Required fields cannot be blank'});
        } else if (!blankCheck.test(data.service_city) && !cityCheck.test(data.service_city)) {
            this.setState({status: 'error', statusMessage: 'Invalid city name'});
        } else if (!data.service_negotiable && (blankCheck.test(data.service_price_rate) && blankCheck.test(data.service_price_rate_type) || (!data.service_price_rate && !data.service_price_rate_type))) {
            this.setState({status: 'error', statusMessage: 'Please enter your rate'});
        } else {
            this.props.edit(data);
            this.setState({editing: false});
        }
    }

    changeAvailability() {
        this.setState({status: 'Loading'});

        fetch.post('/api/user/services/status', {id: this.props.id, available: this.state.available === 'Active' ? 'Inactive' : 'Active'})
        .then(resp => {
            if (resp.data.status === 'service status success') {
                this.setState({
                    available: resp.data.available,
                    status: ''
                })
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage, available: resp.data.available});
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        console.log(this.state)
        let status, body, editButton;

        if (this.state.status && this.state.status !== 'Loading') {
            status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} unmount={() => this.setState({status: '', statusMessage: ''})} top={window.pageYOffset + 'px'} />
        } else if (this.state.status && this.state.status === 'Loading') {
            status = <Loading size='2x' />
        }

        if (this.state.editing) {
            body = <ServiceForm user={this.props.user} service={this.props.service} submit={(data) => this.editService(data)} cancel={() => this.setState({editing: false})} />;
            editButton = <button className='btn btn-secondary btn-sm service-buttons mr-1' onClick={() => this.setState({editing: false})}>Cancel</button>;
        } else {
            editButton = <button className='btn btn-info btn-sm service-buttons mr-1' onClick={() => this.setState({editing: true})}><FontAwesomeIcon icon={faEdit} /></button>;
        }

        return(
            <div className='grey-panel user-services-details mb-3 rounded'>
                <div className='d-flex-between-center'>
                    <div><NavLink to={`/service/${this.props.service.service_id}`}>{this.props.service.service_name}</NavLink></div>

                    <div className='d-flex-between-center'>
                        <div className='mr-1'>{this.props.service.service_created_on}</div>
                        {editButton}
                        <button id='delete-service-button' className='btn btn-danger btn-sm service-buttons mr-1' onClick={this.confirmDelete.bind(this)}><FontAwesomeIcon icon={faTrash} /></button>
                        <SlideToggle id={this.props.id} status={this.state.available} onClick={() => this.changeAvailability()} inactiveColor='#ED463D' />
                    </div>
                </div>

                {status}
                {body}
            </div>
            /* <div className='card user-services-details mb-3 rounded'>
                {status}
                <h5 className='card-header d-flex justify-content-between'>
                    {this.props.service.service_name}
                    
                    <div>
                        {editButton}
                        <button id='delete-service-button' className='btn btn-danger btn-sm service-buttons' onClick={this.confirmDelete.bind(this)}><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                </h5>

                <div className='card-body position-relative'>
                    {body}
                </div>

                <div className='card-footer user-services-footer'>
                    <SlideToggle id={this.props.id} status={this.state.available} onClick={() => this.changeAvailability()} inactiveColor='#ED463D' />
                </div>
            </div> */
        )
    }
}

Service.propTypes = {
    id: PropTypes.number.isRequired,
    service: PropTypes.shape({
        service: PropTypes.shape({
            service_city: PropTypes.string,
            service_country: PropTypes.string,
            service_detail: PropTypes.string,
            service_id: PropTypes.number.isRequired,
            service_listed_under: PropTypes.string.isRequired,
            service_name: PropTypes.string.isRequired,
            service_provided_by: PropTypes.string.isRequired,
            service_region: PropTypes.string,
            service_status: PropTypes.string.isRequired,
            service_worldwide: PropTypes.bool
        })
    }).isRequired,
    deleteService: PropTypes.func.isRequired
}

const mapStateToProps = state => {
    return {
        user: state.Login,
        delete: state.Confirmation.option,
        data: state.Confirmation.data
    }
}

export default connect(mapStateToProps)(Service);