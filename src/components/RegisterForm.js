import React, { Component } from 'react';
import { connect } from 'react-redux';
import SubmitButton from './SubmitButton';
import { withRouter } from 'react-router-dom';
import { RegisterUser } from '../actions/RegisterActions';

class RegisterForm extends Component {
    constructor() {
        super();

        this.state = {
            username: null,
            password: null,
            confirmPassword: null,
            email: null,
            confirmEmail: null
        }
    }
    
    handleRegister() {
        this.props.dispatch(RegisterUser(this.state));
    }

    render() {
        return(
            <div>
                <h2>Register</h2>
                
                <form method='POST' onSubmit={(e) => {
                    e.preventDefault();
                    this.handleRegister();
                }}>
                    <div className='form-group'>
                        <label htmlFor='username'>Username: </label>
                        <input className='form-control' type='text' name='username' id='reg-username' onChange={(e) => {
                            this.setState({
                                username: e.target.value
                            })
                        }} />
                    </div>
    
                    <div className='form-group'>
                        <label htmlFor='password'>Password: </label>
                        <input className='form-control' type='password' name='password' id='reg-password' onChange={(e) => {
                            this.setState({
                                password: e.target.value
                            })
                        }} />
                    </div>
    
                    <div className='form-group'>
                        <label htmlFor='confirm-password'>Confirm Password: </label>
                        <input className='form-control' type='password' name='confirm_password' id='reg-confirm-password' onChange={(e) => {
                            this.setState({
                                confirmPassword: e.target.value
                            })
                        }} />
                    </div>
    
                    <div className='form-group'>
                        <label htmlFor='email'>Email: </label>
                        <input className='form-control' type='email' name='email' id='reg-email' onChange={(e) => {
                            this.setState({
                                email: e.target.value
                            })
                        }} />
                    </div>
    
                    <div className='form-group'>
                        <label htmlFor='confirm-email'>Confirm Email: </label>
                        <input className='form-control' type='email' name='confirm_email' id='reg-confirm-email' onChange={(e) => {
                            this.setState({
                                confirmEmail: e.target.value
                            })
                        }} />
                    </div>
    
                    <div className='form-buttons'>
                        <SubmitButton loading={this.props.status} value='Submit' />
    
                        <button type='reset' className='btn btn-secondary' disabled={this.props.status === 'loading' ? true : false} onClick={() => {
                            this.setState({
                                username: null,
                                password: null,
                                confirmPassword: null,
                                email: null,
                                confirmEmail: null
                            });
                        }}>
                            Clear
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        status: state.Register.status
    }
}

export default withRouter(connect(mapStateToProps)(RegisterForm));