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
import LoginPanel from '../includes/site/LoginPanel';

class Login extends Component {
    render() {
        if (this.props.user.user) {
            return <Redirect to='/dashboard/edit' />;
        }

        return(
            <section id='login'>
                <TitledContainer title='Login' icon={<FontAwesomeIcon icon={faSignInAlt} />}>
                    <LoginPanel />
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

export default Login;