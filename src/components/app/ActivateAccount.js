import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import Loading from '../utils/Loading';
import { withRouter } from 'react-router-dom';

class ActivateAccount extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Activating'
        }
    }

    componentDidMount() {
        fetch.post('/api/activate-account', {key: this.props.match.params.key})
        .then(resp => {
            this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
        })
        .catch(err => {
            LogError(err, '/api/activate-account');
            this.setState({status: 'error', statusMessage: 'An error occurred. Account activation unavailable at this time.'});
        });
    }
    
    render() {
        if (this.state.status === 'Activating') {
            return <Loading size='7x' color='black' />;
        } else if (this.state.status === 'success') {
            return (
                <section id='activate-account' className='main-panel centered'>
                    <h1>Success!</h1>
                    <span>Your account has been activated.</span>
                </section>
            );
        } else if (this.state.status === 'error') {
            return(
                <section id='activate-account' className='main-panel centered'>
                    <h1>We're Sorry!</h1>
                    <span>{this.state.statusMessage}</span>
                </section>
            )
        }
    }
}

export default withRouter(ActivateAccount);