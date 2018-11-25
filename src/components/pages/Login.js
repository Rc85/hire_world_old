import React, { Component } from 'react';
import { LoginUser } from '../../actions/LoginActions';
import { connect } from 'react-redux';
import SubmitButton from '../utils/SubmitButton';
import { withRouter, Redirect } from 'react-router-dom';
import Response from './Response';

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
        if (this.props.user.user) {
            return <Redirect to='/dashboard/edit' />;
        } else if (this.props.user.status === 'access error') {
            return <Response code={403} header={'Forbidden'} message={this.props.user.statusMessage} />;
        } else {
            return(
                <section id='login' className='main-panel'>
                    <div className='blue-panel shallow rounded'>
                        <h2>Login</h2>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            this.handleLogin();
                        }}>
                            <div className='form-group'>
                                <label htmlFor='username'>Username: </label>
                                <input className='form-control' type='text' name='username' id='login-username' onChange={(e) => this.setState({username: e.target.value})} />
                            </div>
            
                            <div className='form-group'>
                                <label htmlFor='password'>Password: </label>
                                <input className='form-control' type='password' name='password' id='login-password' onChange={(e) => this.setState({password: e.target.value})} />
                            </div>
    
                            <div className='text-right'>
                                <SubmitButton type='submit' loading={/loading$/.test(this.props.user.status)} value='Login' onClick={() => {return false}}/>
    
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

export default withRouter(connect()(Login));