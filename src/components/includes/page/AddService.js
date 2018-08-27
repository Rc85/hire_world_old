import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AddService as add } from '../../../actions/AddServicesActions';
import PropTypes from 'prop-types';
import ServiceForm from './ServiceForm';

class AddService extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null
        }
    }

    addService(data) {
        let blankCheck = /^\s*$/;
        let cityCheck = /^[a-zA-Z]*$/;
        let error;

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
            this.props.dispatch(add(data))

            this.props.callback();
        }
    }

    removeServiceForm() {
        this.props.callback();
    }

    render() {
        return(
            <div className='add-service mb-3'>
                <ServiceForm submit={(data) => this.addService(data)} cancel={() => this.removeServiceForm()} />
            </div>
        )
    }
}

AddService.propTypes = {
    callback: PropTypes.func.isRequired
}

export default connect()(AddService);