import React, { Component } from 'react';
import { LoginUser } from '../actions/LoginActions';
import '../styles/Login.css';
import { connect } from 'react-redux';
import SubmitButton from './SubmitButton';
import { withRouter } from 'react-router-dom';

class Login extends Component {
    constructor() {
        super();

        this.state  = {
            username: null,
            password: null
        }
    }

    handleLogin() {
        this.props.dispatch(LoginUser(this.state));
    }

    render() {
        return(
            <section id='login' className='blue-panel shallow' style={this.props.show ? {display: 'block'} : {display: 'none'}}>
                <h2>Login</h2>

                <form method='POST' onSubmit={(e) => {
                    e.preventDefault();

                    this.handleLogin();
                }}>
                    <div className='form-group'>
                        <label htmlFor='username'>Username: </label>
                        <input className='form-control' type='text' name='username' id='login-username' onChange={(e) => {
                            this.setState({username: e.target.value});
                        }} />
                    </div>
    
                    <div className='form-group'>
                        <label htmlFor='password'>Password: </label>
                        <input className='form-control' type='password' name='password' id='login-password' onChange={(e) => {
                            this.setState({password: e.target.value});
                        }} />
                    </div>

                    <div className='text-right'>
                        <SubmitButton loading={this.props.status} value='Login' />

                        <div className='mt-3'>
                            Forgot Password
                        </div>
                    </div>
                </form>
            </section>
        )
    }
}

const mapPropsToState = state => {
    return {
        status: state.Login.status
    }
}

export default withRouter(connect(mapPropsToState)(Login));