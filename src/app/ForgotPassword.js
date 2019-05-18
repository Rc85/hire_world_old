import React, { Component } from 'react';
import InputWrapper from '../components/utils/InputWrapper';
import Recaptcha from 'react-recaptcha';
import fetch from 'axios';
import SubmitButton from '../components/utils/SubmitButton';
import { Alert } from '../actions/AlertActions';
import { LogError } from '../components/utils/LogError';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { IsTyping } from '../actions/ConfigActions';

let onloadCallback = function() {
    return;
}
let recaptchaInstance;

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
                recaptchaInstance.reset();
            }
        })
        .catch(err => {
            LogError(err, '/api/forgot-password');
            this.setState({status: ''});
            recaptchaInstance.reset();
        });
    }

    verify(val) {
        this.setState({verified: val});
    }
    
    render() {
        if (this.state.status === 'success') {
            return <Redirect to='/reset-password-email-sent' />;
        }

        return (
            <section id='forgot-password' className='main-panel centered'>
                <div className='simple-container'>
                    <div className='simple-container-title'>Reset Password</div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        this.submit();
                    }}>
                        <InputWrapper label='Email' required className='mb-3'>
                            <input type='email' onChange={(e) => this.setState({email: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} required />
                        </InputWrapper>
    
                        <Recaptcha sitekey='6Le5uJ4UAAAAAMvk94nwQjc9_8nln2URksn1152W' render='explicit' onloadCallback={onloadCallback} verifyCallback={(val) => this.verify(val)} ref={e => recaptchaInstance = e} />
    
                        <div className='mt-3 text-right'><SubmitButton type='submit' loading={this.state.status === 'Sending'} /></div>
                    </form>
                </div>
            </section>
        );
    }
}

export default connect()(ForgotPassword);