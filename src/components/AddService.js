import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AddService as add } from '../actions/AddServicesActions';

class AddService extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: null,
            description: null
        }
    }

    addService() {
        this.props.dispatch(add(this.state));

        this.props.callback();
    }

    removeServiceForm() {
        this.props.callback();
    }

    render() {
        return(
            <div className='add-service mb-3'>
                <input type='text' name='name' className='form-control mb-1' placeholder='Service name (required)' required
                onChange={(e) => {
                    this.setState({
                        name: e.target.value
                    })
                }}/>
                <textarea name='description' rows='4' className='form-control w-100 mb-1' placeholder='A brief description of the service'
                onChange={(e) => {
                    this.setState({
                        description: e.target.value
                    })
                }}></textarea>
                <div className='text-right'>
                    <button className='btn btn-primary mr-1' onClick={this.addService.bind(this)}>Add</button>
                    <button className='btn btn-secondary' onClick={this.removeServiceForm.bind(this)}>Discard</button>
                </div>
            </div>
        )
    }
}

export default connect()(AddService);