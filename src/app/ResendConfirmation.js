import React, { Component } from 'react';
import SubmitButton from '../components/utils/SubmitButton';
import InputWrapper from '../components/utils/InputWrapper';
import Recaptcha from 'react-recaptcha';
import fetch from 'axios';
import { Alert } from '../actions/AlertActions';
import { LogError } from '../components/utils/LogError';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { IsTyping } from '../actions/ConfigActions';

let onloadCallback = function() {
    return;
}

class ResendConfirmation extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            email: '',
            verified: false,
            status: ''
        }
    }
    
    verify(val) {
        this.setState({verified: val});
    }

    submit() {
        this.setState({status: 'Sending'});

        fetch.post('/api/resend-confirmation', {email: this.state.email, verified: this.state.verified})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: 'success'});
            } else {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            LogError(err, '/api/resend-confirmation');
            this.setState({status: ''});
        });
    }

    render() {
        if (this.state.status === 'success') {
            return <Redirect to='/confirmation-sent' />;
        }

        return (
            <section id='resend' className='main-panel'>
                <div className='simple-container'>
                    <div className='simple-container-title'>Resend Confirmation</div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        this.submit();
                    }}>
                        <InputWrapper label='Email' required className='mb-3'>
                            <input type='email' onChange={(e) => this.setState({email: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputWrapper>

                        <Recaptcha sitekey='6Le5uJ4UAAAAAMvk94nwQjc9_8nln2URksn1152W' render='explicit' onloadCallback={onloadCallback} verifyCallback={(val) => this.verify(val)} />

                        <div className='mt-3 text-right'><SubmitButton type='submit' loading={this.state.status === 'Sending'} /></div>
                    </form>
                </div>
            </section>
        );
    }
}

export default connect()(ResendConfirmation);