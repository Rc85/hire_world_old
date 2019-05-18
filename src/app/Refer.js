import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../components/utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsersMedical, faPlus, faTrash } from '@fortawesome/pro-solid-svg-icons';
import InputWrapper from '../components/utils/InputWrapper';
import SubmitButton from '../components/utils/SubmitButton';
import { Alert } from '../actions/AlertActions';
import { connect } from 'react-redux';
import fetch from 'axios';
import { LogError } from '../components/utils/LogError';
import { Redirect } from 'react-router-dom';

class Refer extends Component {
    constructor(props) {
        super(props);

        this.initialState = {
            status: '',
            emailInput: [
                {id: Date.now(), email: '', referKey: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}
            ]
        }
        
        this.state = {
            status: '',
            emailInput: [
                {id: Date.now(), email: '', referKey: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}
            ]
        }
    }

    handleEmailChange(i, e) {
        let emailInput = [...this.state.emailInput];
        emailInput[i].email = e.target.value;

        this.setState({emailInput: emailInput});
    }

    addEmailInput() {
        let emailInput = [...this.state.emailInput];
        emailInput.push({id: Date.now(), email: '', referKey: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)});

        this.setState({emailInput: emailInput});
    }

    removeEmailInput(i) {
        let emailInput = [...this.state.emailInput];
        emailInput.splice(i, 1);

        this.setState({emailInput: emailInput});
    }

    submit(e) {
        e.preventDefault();
        let hasEmail = false;

        for (let email of this.state.emailInput) {
            if (email.email || !/^\s*$/.test(email.email)) {
                hasEmail = true;
                break;
            }
        }

        if (hasEmail) {
            this.setState({status: 'Sending'});

            fetch.post('/api/refer', this.state.emailInput)
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState(this.initialState);
                } else {
                    this.setState({status: ''});
                }

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            })
            .catch(err => {
                LogError(err, '/api/refer');
                this.setState({status: ''});
                this.props.dispatch(Alert('error', 'An error occurred'));
            })
        } else {
            this.props.dispatch(Alert('error', 'At least one email is required'));
        }
    }

    reset() {
        this.setState(this.initialState);
    }
    
    render() {
        if (this.props.user.user) {
            return (
                <section id='refer-a-friend' className='main-panel'>
                    <TitledContainer title='Refer a Friend' icon={<FontAwesomeIcon icon={faUsersMedical} />} bgColor='orange' shadow>
                        <div className='text-right mb-3'><button className='btn btn-info' type='button' onClick={this.addEmailInput.bind(this)}><FontAwesomeIcon icon={faPlus} /></button></div>

                        <form onSubmit={this.submit.bind(this)}>
                            {this.state.emailInput.map((input, i) => {
                                return <div key={input.id} className='d-flex-center mb-1'>
                                    <InputWrapper label='Email' className='fg-1'>
                                        <input type='email' onChange={this.handleEmailChange.bind(this, i)} placeholder='Email' value={input.email} />
                                    </InputWrapper>
        
                                    {this.state.emailInput.length > 1 ? <button className='btn btn-secondary ml-2' type='button' onClick={this.removeEmailInput.bind(this, i)}><FontAwesomeIcon icon={faTrash} /></button> : ''}
                                </div>
                            })}

                            <div className='text-right'>
                                <SubmitButton type='submit' loading={this.state.status === 'Sending'} value='Send' />
                                <button className='btn btn-secondary' type='button' onClick={this.reset.bind(this)}>Reset</button>
                            </div>
                        </form>
                    </TitledContainer>
                </section>
            );
        } else {
            return <Redirect to='/error/app/404' />;
        }
    }
}

Refer.propTypes = {

};

export default connect()(Refer);