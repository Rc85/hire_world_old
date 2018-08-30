import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEdit } from '@fortawesome/free-solid-svg-icons';
import { ShowConfirmation } from '../../../actions/ConfirmationActions';
import SlideToggle from '../../utils/SlideToggle';
import Alert from '../../utils/Alert';
import ServiceForm from './ServiceForm';
import PropTypes from 'prop-types';
import { Tooltip } from 'reactstrap';
import Loading from '../../utils/Loading';
import fetch from 'axios';

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
                }
            }
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

        if ((blankCheck.test(data.name) || !data.name) || !data.listUnder || (!data.worldwide && blankCheck.test(data.country))) {
            this.setState({status: 'error', statusMessage: 'Required fields cannot be blank'});
        } else if (!blankCheck.test(data.city) && !cityCheck.test(data.city)) {
            this.setState({status: 'error', statusMessage: 'Invalid city name'});
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
        let status, body, editButton;
        let blankCheck = /^\s*$/;

        if (this.state.status) {
            if (this.state.status !== 'Loading') {
                status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} unmount={() => this.setState({status: '', statusMessage: ''})} />
            } else {
                status = <Loading size='2x' />
            }
        }

        let location = <div>
            {blankCheck.test(this.props.service.service_city) ? '' : <span>{this.props.service.service_city}, </span>}
            {blankCheck.test(this.props.service.service_region) ? '' : <span>{this.props.service.service_region}, </span>}
            <span>{this.props.service.service_country}</span>
        </div>

        if (this.state.editing) {
            body = <ServiceForm service={this.props.service} submit={(data) => this.editService(data)} cancel={() => this.setState({editing: false})} />;
            editButton = <button className='btn btn-secondary btn-sm service-buttons mr-1' onClick={() => this.setState({editing: false})}>Cancel</button>;
        } else {
            body = <div className='services-body'>
                <small>Renewed {this.props.service.service_created_on}</small>
                <div className='mb-3'>
                    <label>Details:</label>
                    <div className='grey-panel rounded user-services-details'>
                        {this.props.service.service_detail}
                    </div>
                </div>

                <div className='d-flex justify-content-between'>
                    <div className='w-35'>
                        <label>Listed Under:</label>
                        <div className='grey-panel rounded'>{this.props.service.service_listed_under}</div>
                    </div>
    
                    <div className='w-60'>
                        <label>Location</label>
                        <div className='grey-panel rounded'>{this.props.service.service_worldwide ? <span>World-wide</span> :  location}</div>
                    </div>
                </div>
            </div>
            editButton = <button className='btn btn-info btn-sm service-buttons mr-1' onClick={() => this.setState({editing: true})}><FontAwesomeIcon icon={faEdit} /></button>;
        }

        return(
            <div className='card user-services-details mb-3 rounded'>
                <h5 className='card-header d-flex justify-content-between'>
                    {this.props.service.service_name}
                    
                    <div>
                        {editButton}
                        <button id='delete-service-button' className='btn btn-danger btn-sm service-buttons' onClick={this.confirmDelete.bind(this)}><FontAwesomeIcon icon={faTimes} /></button>
                        <Tooltip placement='right' isOpen={this.state.tooltipOpen} target='delete-service-button' toggle={() => this.setState({tooltipOpen: !this.state.tooltipOpen})}>Delete</Tooltip>
                    </div>
                </h5>

                <div className='card-body position-relative'>
                    {body}
                    {status}
                </div>

                <div className='card-footer user-services-footer'>
                    <SlideToggle id={this.props.id} status={this.state.available} onClick={() => this.changeAvailability()} inactiveColor='#ED463D' />
                </div>
            </div>
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
        delete: state.Confirmation.option,
        data: state.Confirmation.data
    }
}

export default connect(mapStateToProps)(Service);