import React, { Component } from 'react';
import { LoginUser } from '../../actions/LoginActions';
import { connect } from 'react-redux';
import SubmitButton from '../utils/SubmitButton';
import { withRouter, Redirect } from 'react-router-dom';
import Response from './Response';
import Loading from '../utils/Loading';
import { Alert } from '../../actions/AlertActions';
import TitledContainer from '../utils/TitledContainer';
import InputWrapper from '../utils/InputWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';

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

    handleLoginKeyDown(e, input) {
        if (e.keyCode === 13) {
            if (input === 'username') {
                document.getElementById('login-password').focus();
            } else if (input === 'password') {
                this.handleLogin();
            }
        } else {
            return
        }
    }

    render() {
        if (this.props.user.user) {
            return <Redirect to='/dashboard/edit' />;
        }

        return(
            <section id='login'>
                <TitledContainer title='Login' icon={<FontAwesomeIcon icon={faSignInAlt} />}>
                    <div id='login-form'>
                        <div className='login-field'>
                            <InputWrapper label='Username'>
                                <input type='text' onChange={(e) => this.setState({username: e.target.value})} onKeyDown={(e) => this.handleLoginKeyDown(e, 'username')} />
                            </InputWrapper>
                        </div>
                        <div className='login-field'>
                            <InputWrapper label='Password'>
                                <input type='password' id='login-password' onChange={(e) => this.setState({password: e.target.value})} onKeyDown={(e) => this.handleLoginKeyDown(e, 'password')} />
                            </InputWrapper>
                        </div>

                        <a href='/forgot-password' id='forgot-password'>Forgot Password</a>

                        <div className='text-right'><SubmitButton type='submit' id='login-button' loading={this.props.user.status === 'login in'} value='Login' onClick={() => this.handleLogin()}/></div>
                    </div>
                </TitledContainer>
                {/* <div className='blue-panel shallow rounded'>
                    <h2>Login</h2>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        this.handleLogin();
                    }}>
                        <div className='form-group'>
                            <label htmlFor='username'>Username: </label>
                            <input type='text' name='username' id='login-username' onChange={(e) => this.setState({username: e.target.value})} />
                        </div>
        
                        <div className='form-group'>
                            <label htmlFor='password'>Password: </label>
                            <input type='password' name='password' id='login-password' onChange={(e) => this.setState({password: e.target.value})} />
                        </div>

                        <div className='text-right'>
                            <SubmitButton type='submit' loading={this.props.user.status === 'getting session'} value='Login' onClick={() => {return false}}/>

                            <div className='mt-3'>
                                Forgot Password
                            </div>
                        </div>
                    </form>
                </div> */}
            </section>
        )
    }
}

export default withRouter(connect()(Login));