import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LoginUser } from '../../../actions/LoginActions';
import { connect } from 'react-redux';
import InputWrapper from '../../utils/InputWrapper';
import SubmitButton from '../../utils/SubmitButton';
import { isTyping } from '../../../actions/ConfigActions';
import { NavLink } from 'react-router-dom';

class LoginPanel extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            username: null,
            password: null
        }
    }
    
    handleLogin(e) {
        e.preventDefault();

        this.setState({status: 'Logging in'});

        this.props.dispatch(LoginUser(this.state));
    }

    register() {
        location.href = '/register';
    }

    render() {
        return (
            <div id='login-panel'>
                <form onSubmit={(e) => this.handleLogin(e)}>
                    <InputWrapper label='Username' className='mb-3'>
                        <input type='text' onChange={(e) => this.setState({username: e.target.value})} maxLength='25' />
                    </InputWrapper>

                    <InputWrapper label='Password' className='mb-1'>
                        <input type='password' onChange={(e) => this.setState({password: e.target.value})} minLength='6' maxLength='20' />
                    </InputWrapper>

                    <div className='mb-3'><NavLink to='/forgot-password'>Forgot Password</NavLink></div>

                    <div className='text-right'>
                        <SubmitButton type='submit' loading={this.state.status === 'Logging in'} value='Login' />
                        <NavLink to='/register'><button type='button' className='btn btn-info'>Register</button></NavLink>
                    </div>
                </form>
            </div>
        );
    }
}

LoginPanel.propTypes = {

};

export default connect()(LoginPanel);