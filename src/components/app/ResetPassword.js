import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputWrapper from '../utils/InputWrapper';
import SubmitButton from '../utils/SubmitButton';
import { IsTyping } from '../../actions/ConfigActions';
import fetch from 'axios';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Alert } from '../../actions/AlertActions';
import { LogError } from '../utils/LogError';

class ResetPassword extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            password: '',
            confirm: ''
        }
    }

    submit() {
        this.setState({status: 'Resetting'});

        fetch.post('/api/reset-password', {password: this.state.password, confirm: this.state.confirm, key: this.props.match.params.key})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: 'success'});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            LogError(err, '/api/reset-password');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }
    
    render() {
        if (this.state.status === 'success') {
            return <Redirect to='/password-resetted' />;
        }

        return (
            <section id='reset-password' className='main-panel centered'>
                <div className='simple-container'>
                    <div className='simple-container-title'>Reset Password</div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        this.submit();
                    }}>
                        <InputWrapper label='Password' required className='mb-3'>
                            <input type='password' onChange={(e) => this.setState({password: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required minLength='6' placeholder='Min. 6 characters' />
                        </InputWrapper>

                        <InputWrapper label='Confirm Password' required className='mb-3'>
                            <input type='password' onChange={(e) => this.setState({confirm: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required minLength='6' />
                        </InputWrapper>
    
                        <div className='mt-3 text-right'><SubmitButton type='submit' loading={this.state.status === 'Resetting'} /></div>
                    </form>
                </div>
            </section>
        );
    }
}

ResetPassword.propTypes = {

};

export default withRouter(connect()(ResetPassword));