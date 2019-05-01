import React, { Component } from 'react';
import InputWrapper from '../../utils/InputWrapper';
import { TwoFALogin } from '../../../actions/LoginActions';
import { connect } from 'react-redux';
import { LoggingIn } from '../../../actions/ConfigActions';

class TwoFactorLogin extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            code: ''
        }
    }
    
    login() {
        this.props.dispatch(TwoFALogin(this.state.code));
    }

    componentWillUnmount() {
        this.props.dispatch(LoggingIn(false));
    }

    render() {
        return (
            <div id='login-panel'>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    this.login();
                }}>
                    <InputWrapper label='6 Digit Code' required className='mb-3'>
                        <input type='text' onChange={(e) => this.setState({code: e.target.value})} required onFocus={() => this.props.dispatch(LoggingIn(true))} onBlur={() => this.props.dispatch(LoggingIn(false))} autoFocus />
                    </InputWrapper>

                    <div className='text-right'><button type='submit' className='btn btn-primary'>Login</button></div>
                </form>
            </div>
        );
    }
}

export default connect()(TwoFactorLogin);