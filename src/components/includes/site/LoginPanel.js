import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LoginUser } from '../../../actions/LoginActions';
import { connect } from 'react-redux';
import InputWrapper from '../../utils/InputWrapper';
import SubmitButton from '../../utils/SubmitButton';
import { NavLink } from 'react-router-dom';
import { LoggingIn } from '../../../actions/ConfigActions';

class LoginPanel extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            username: null,
            password: null
        }
    }

    componentWillUnmount() {
        this.props.dispatch(LoggingIn(false));
    }
    
    register() {
        location.href = '/register';
    }

    render() {
        return (
            <div id='login-panel'>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    this.props.dispatch(LoginUser(this.state));
                }}>
                    <InputWrapper label='Username' className='mb-3'>
                        <input type='text' onChange={(e) => this.setState({username: e.target.value})} maxLength='25' onFocus={() => this.props.dispatch(LoggingIn(true))} onBlur={() => this.props.dispatch(LoggingIn(false))} />
                    </InputWrapper>

                    <InputWrapper label='Password' className='mb-1'>
                        <input type='password' onChange={(e) => this.setState({password: e.target.value})} minLength='6' maxLength='20' onFocus={() => this.props.dispatch(LoggingIn(true))} onBlur={() => this.props.dispatch(LoggingIn(false))} />
                    </InputWrapper>

                    <div className='mb-3'><NavLink to='/forgot-password'>Forgot Password</NavLink></div>

                    <div className='text-right'>
                        <SubmitButton type='submit' loading={this.props.user.status === 'login begin'} value='Login' />
                        <NavLink to='/register'><button type='button' className='btn btn-info'>Register</button></NavLink>
                    </div>
                </form>
            </div>
        );
    }
}

LoginPanel.propTypes = {
    user: PropTypes.object
};

const mapStateToProps = state => {
    return {
        user: state.Login
    }
}

export default connect(mapStateToProps)(LoginPanel);