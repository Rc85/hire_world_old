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
            confirmEmail: null,
            firstName: null,
            lastName: null,
            country: null,
            city: null
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
                        <label htmlFor='reg-username'>Username: </label>
                        <input className='form-control' type='text' name='username' id='reg-username' required onChange={(e) => {
                            this.setState({
                                username: e.target.value
                            });
                        }} />
                    </div>
    
                    <div className='form-group d-flex justify-content-between'>
                        <div className='w-45'>
                            <div><label htmlFor='reg-password'>Password: </label></div>
                            <input className='form-control' type='password' name='password' id='reg-password' required onChange={(e) => {
                                this.setState({
                                    password: e.target.value
                                });
                            }} />
                        </div>

                        <div className='w-45'>
                            <div><label htmlFor='reg-confirm-password'>Confirm Password: </label></div>
                            <input className='form-control' type='password' name='confirm_password' id='reg-confirm-password' required onChange={(e) => {
                                this.setState({
                                    confirmPassword: e.target.value
                                });
                            }} />
                        </div>
                    </div>

                    <div className='form-group d-flex justify-content-between'>
                        <div className='w-45'>
                            <div><label htmlFor='reg-email'>Email: </label></div>
                            <input className='form-control' type='email' name='email' id='reg-email' required onChange={(e) => {
                                this.setState({
                                    email: e.target.value
                                });
                            }} />
                        </div>

                        <div className='w-45'>
                            <div><label htmlFor='reg-confirm-email'>Confirm Email: </label></div>
                            <input className='form-control' type='email' name='confirm_email' id='reg-confirm-email' required onChange={(e) => {
                                this.setState({
                                    confirmEmail: e.target.value
                                });
                            }} />
                        </div>
                    </div>

                    <h5>Optional</h5>

                    <hr/>

                    <div className='form-group d-flex justify-content-between'>
                        <div className='w-45'>
                            <div><label htmlFor='reg-fname'>First Name: </label></div>
                            <input className='form-control' type='text' name='fname' id='reg-fname' onChange={(e) => {
                                this.setState({
                                    firstName: e.target.value
                                });
                            }} />
                        </div>

                        <div className='w-45'>
                            <div><label htmlFor='reg-lname'>Last Name: </label></div>
                            <input className='form-control' type='text' name='lname' id='reg-lname' onChange={(e) => {
                                this.setState({
                                    lastName: e.target.value
                                });
                            }} />
                        </div>
                    </div>

                    <div className='form-group d-flex justify-content-between'>
                        <div className='w-45'>
                            <div><label htmlFor='reg-country'>Country: </label></div>
                            <input className='form-control' type='text' name='fname' id='reg-country' onChange={(e) => {
                                this.setState({
                                    country: e.target.value
                                });
                            }} />
                        </div>

                        <div className='w-45'>
                            <div><label htmlFor='reg-city'>City: </label></div>
                            <input className='form-control' type='text' name='lname' id='reg-city' onChange={(e) => {
                                this.setState({
                                    city: e.target.value
                                });
                            }} />
                        </div>
                    </div>

                    <div className='form-group form-check'>
                        <input type='checkbox' name='agree' id='reg-agree' className='form-check-input'/> <label className='form-check-label' htmlFor='reg-agree'>I read, understand, and agree with the terms of service.</label>
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