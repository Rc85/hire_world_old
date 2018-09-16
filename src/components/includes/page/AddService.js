import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ServiceForm from './ServiceForm';
import Alert from '../../utils/Alert';

export default class AddService extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: '',
            statusMessage: ''
        }
    }

    addService(data) {
        let blankCheck = /^\s*$/;
        let cityCheck = /^[a-zA-Z]*$/;

        if ((blankCheck.test(data.name) || !data.name) || !data.listUnder || (!data.worldwide && blankCheck.test(data.country))) {
            this.setState({
                status: 'error',
                statusMessage: 'Required fields cannot be blank'
            });
        } else if (!blankCheck.test(data.city) && !cityCheck.test(data.city)) {
            this.setState({
                status: 'error',
                statusMessage: 'Invalid city name'
            });
        } else if (!data.negotiable) {
            if (blankCheck.test(data.price_rate) && blankCheck.test(data.priceType)) {
                this.setState({
                    status: 'error',
                    statusMessage: 'Price is required'
                });
            }
        } else {
            this.props.add(data)
        }
    }

    removeServiceForm() {
        this.props.remove();
    }

    render() {
        let error;

        if (this.state.status) {
            error = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />
        }

        return(
            <div className='add-service mb-3'>
                {error}
                <ServiceForm submit={(data) => this.addService(data)} cancel={() => this.removeServiceForm()} />
            </div>
        )
    }
}

AddService.propTypes = {
    add: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired
}