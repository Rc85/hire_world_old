import React, { Component } from 'react';
import InputWrapper from '../utils/InputWrapper';
import Recaptcha from 'react-recaptcha';
import fetch from 'axios';
import SubmitButton from '../utils/SubmitButton';
import { Alert } from '../../actions/AlertActions';
import { LogError } from '../utils/LogError';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { isTyping } from '../../actions/ConfigActions';

let onloadCallback = function() {
    return;
}

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: ''
        }
    }
    
    submit() {
        this.setState({status: 'Sending'});

        fetch.post('/api/forgot-password', {email: this.state.email, verified: this.state.verified})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: 'success'});
            } else {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMesage));
            }
        })
        .catch(err => {
            LogError(err, '/api/reset-password');
            this.setState({status: ''});
        });
    }

    verify(val) {
        this.setState({verified: val});
    }
    
    render() {
        if (this.state.status === 'success') {
            return <Redirect to='/reset-password-sent' />;
        }

        return (
            <section id='forgot-password' className='main-panel'>
                <div className='simple-container'>
                    <div className='simple-container-title'>Reset Password</div>

                    <InputWrapper label='Email' required className='mb-3'>
                        <input type='email' onChange={(e) => this.setState({email: e.target.value})} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                    </InputWrapper>

                    <Recaptcha sitekey='6LdKOIIUAAAAAPRGJ4dDSoHfb1Dad0vxuD4s5gjG' render='explicit' onloadCallback={onloadCallback} verifyCallback={(val) => this.verify(val)} />

                    <div className='mt-3 text-right'><SubmitButton type='submit' loading={this.state.status === 'Sending'} /></div>
                </div>
            </section>
        );
    }
}

export default connect()(ForgotPassword);