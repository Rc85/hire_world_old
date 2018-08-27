import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEdit } from '@fortawesome/free-solid-svg-icons';
import { DeleteService, EditService } from '../../../actions/ServiceActions';
import { ShowConfirmation } from '../../../actions/ConfirmationActions';
import SlideToggle from '../../utils/SlideToggle';
import Alert from '../../utils/Alert';
import ServiceForm from './ServiceForm';
import { ToggleService } from '../../../actions/ServiceActions';
import PropTypes from 'prop-types';
import { Button, Card, CardBody, CardHeader, CardFooter } from 'reactstrap';

class Service extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editing: false,
            error: false,
            status: this.props.service.service_status
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
        this.props.dispatch(DeleteService(this.props.id, this.props.services));
    }

    editService(data) {
        let blankCheck = /^\s*$/;
        let cityCheck = /^[a-zA-Z]*$/;
        let error;
        data['id'] = this.props.id;

        if ((blankCheck.test(data.name) || !data.name) || !data.listUnder || (!data.worldwide && blankCheck.test(data.country))) {
            error = 'required fields';
        } else {
            if (!blankCheck.test(data.city) && !cityCheck.test(data.city)) {
                error = 'invalid city';
            }
        }

        if (error === 'required fields') {
            this.setState({
                error: 'required fields'
            });

            setTimeout(() => {
                this.setState({
                    error: null
                })
            }, 2300);
        } else if (error === 'invalid city') {
            this.setState({
                error: 'invalid city'
            });

            setTimeout(() => {
                this.setState({
                    error: null
                })
            }, 2300);
        } else {
            this.props.dispatch(EditService(data, this.props.services));
            this.setState({editing: false});
        }
    }

    changeAvailability() {
        if (this.state.status === 'Active') {
            this.props.dispatch(ToggleService(this.props.id, 'Inactive', this.props.services));

            this.setState({
                status: 'Inactive'
            });
        } else if (this.state.status === 'Inactive') {
            this.props.dispatch(ToggleService(this.props.id, 'Active', this.props.services));

            this.setState({
                status: 'Active'
            });
        }
    }

    render() {
        let error, body, editButton;
        let blankCheck = /^\s*$/;

        if (this.state.error === 'required fields') {
            error = <Alert status='error' message='Required fields cannot be blank' />;
        } else if (this.state.error === 'invalid city') {
            error = <Alert status='error' message='Invalid city name' />;
        } else if (this.props.status === 'edit service error' || this.props.status === 'edit service fail') {
            error = <Alert status='error' />;
        }

        let location = <div>
            {blankCheck.test(this.props.service.service_city) ? '' : <span>{this.props.service.service_city}, </span>}
            {blankCheck.test(this.props.service.service_region) ? '' : <span>{this.props.service.service_region}, </span>}
            <span>{this.props.service.service_country}</span>
        </div>

        if (this.state.editing) {
            body = <ServiceForm service={this.props.service} submit={(data) => this.editService(data)} cancel={() => this.setState({editing: false})} />;
            editButton = <Button color='secondary' size='sm' className='service-buttons mr-1' onClick={() => this.setState({editing: false})}>Cancel</Button>;
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
            editButton = <Button color='info' size='sm' className='service-buttons mr-1' onClick={() => this.setState({editing: true})}><FontAwesomeIcon icon={faEdit} /></Button>;
        }

        return(
            <Card className='user-services-details mb-3 rounded'>
                <CardHeader>
                    <h5 className='d-flex justify-content-between'>
                        {this.props.service.service_name}
                        
                        <div>
                            {editButton}
                            <Button color='danger' size='sm' className='service-buttons' onClick={this.confirmDelete.bind(this)} title='Delete'><FontAwesomeIcon icon={faTimes} /></Button>
                        </div>
                    </h5>
                </CardHeader>

                <CardBody className='position-relative'>
                    {body}
                    {error}
                </CardBody>

                <CardFooter className='user-services-footer'>
                    <SlideToggle id={this.props.id} status={this.state.status} onClick={() => this.changeAvailability()} inactiveColor='#ED463D' />
                </CardFooter>
            </Card>
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
    }).isRequired
}

const mapStateToProps = state => {
    return {
        status: state.Services.status,
        services: state.Services.services,
        delete: state.Confirmation.option,
        data: state.Confirmation.data
    }
}

export default connect(mapStateToProps)(Service);