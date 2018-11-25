import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LogError } from '../utils/LogError';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Loading from '../utils/Loading';
import AdminErrorRow from './includes/AdminErrorRow';
import fetch from 'axios';

class AdminErrorLog extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: '',
            errors: []
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.location.key !== prevProps.location.key) {
            this.setState({status: 'Loading'});

            fetch.get('/api/admin/get-errors')
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', errors: resp.data.errors})
                } else if (resp.data.status === 'error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => LogError(err, '/api/admin/get-errors'));
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Loading'});

        fetch.get('/api/dev/get-errors')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', errors: resp.data.errors})
            } else if (resp.data.status === 'error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => LogError(err, '/api/dev/get-errors'));
    }
    
    render() {
        let status;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        if (this.state.status === 'error') {
            return <Response code={500} header='Unknown Error' message={this.state.statusMessage} />;
        }

        let errors = this.state.errors.map((error, i) => {
            return <AdminErrorRow key={i} error={error} />;
        });

        return (
            <div className='blue-panel shallow rounded'>
                {status}

                <div className='d-flex-center'>
                    <div className='w-5'><strong>ID</strong></div>
                    <div className='w-10'><strong>Name</strong></div>
                    <div className='w-40'><strong>Message</strong></div>
                    <div className='w-25'><strong>URL</strong></div>
                    <div className='w-10'><strong>Origin</strong></div>
                    <div className='w-5'><strong>Occurrence</strong></div>
                    <div className='w-5'></div>
                </div>

                <hr/>

                {errors}
            </div>
        );
    }
}

AdminErrorLog.propTypes = {

};

export default withRouter(connect()(AdminErrorLog));