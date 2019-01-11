import React, { Component } from 'react';
import { LoginUser } from '../../actions/LoginActions';
import { connect } from 'react-redux';
import SubmitButton from '../utils/SubmitButton';
import { withRouter, Redirect } from 'react-router-dom';
import Response from './Response';
import Loading from '../utils/Loading';
import { Alert } from '../../actions/AlertActions';
import TitledContainer from '../utils/TitledContainer';
import InputText from '../utils/InputText';
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

    handleLoginKeyDown(e) {
        document.getElementById('login-password').focus();
    }

    render() {
        if (this.props.user.user) {
            return <Redirect to='/dashboard/edit' />;
        }

        return(
            <section id='login'>
                <TitledContainer title='Login' icon={<FontAwesomeIcon icon={faSignInAlt} />}>
                    <div id='login-form'>
                        <div className='login-field'><InputText label='Username' type='text' onChange={(val) => this.setState({username: val})} nextInput={() => this.handleLoginKeyDown()} /></div>
                        <div className='login-field'><InputText label='Password' type='password' inputId='login-password' onChange={(val) => this.setState({password: val})} nextInput={() => this.handleLogin()} /></div>

                        <a href='/forgot-password' id='forgot-password'>Forgot Password</a>

                        <div className='text-right'><SubmitButton type='submit' loading={this.props.user.status === 'login in'} value='Login' onClick={() => this.handleLogin()}/></div>
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
                            <input className='form-control' type='text' name='username' id='login-username' onChange={(e) => this.setState({username: e.target.value})} />
                        </div>
        
                        <div className='form-group'>
                            <label htmlFor='password'>Password: </label>
                            <input className='form-control' type='password' name='password' id='login-password' onChange={(e) => this.setState({password: e.target.value})} />
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