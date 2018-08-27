import React, { Component } from 'react';
import { LoginUser } from '../../actions/LoginActions';
import { connect } from 'react-redux';
import SubmitButton from '../utils/SubmitButton';
import { withRouter, Redirect } from 'react-router-dom';
import Alert from '../utils/Alert';

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
        let error;

        switch(this.props.user.status) {
            case 'login error': error = <Alert status='error' />; break;
            case 'login fail': error = <Alert status='error' message='Unable to login' />; break;
            case 'incorrect': error = <Alert status='error' message='Incorrect username or password' />; break;
            case 'banned': error = <Alert status='error' message='Your account has been banned' />; break;
        }

        if (this.props.user.user) {
            return(
                <Redirect to='/dashboard/edit' />
            )
        } else {
            return(
                <section id='login' className='main-panel'>
                    {error}
                    <div className='blue-panel shallow rounded'>
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
                                <SubmitButton type='submit' loading={!this.props.status ? '' : this.props.status} value='Login' onClick={() => {return false}}/>

                                <div className='mt-3'>
                                    Forgot Password
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
            )
        }
    }
}

const mapPropsToState = state => {
    return {
        user: state.Login
    }
}

export default withRouter(connect(mapPropsToState)(Login));