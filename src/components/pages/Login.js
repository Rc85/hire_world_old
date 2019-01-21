import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Loading from '../utils/Loading';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import LoginPanel from '../includes/site/LoginPanel';

class Login extends Component {
    render() {
        if (this.props.user.status === 'get session success' && this.props.user.user) {
            return <Redirect to='/dashboard/edit' />;
        } else if (this.props.user.status === 'getting session') {
            return <Loading size='7x' />;
        } else if (this.props.user.status === 'error') {
            return(
                <section id='login'>
                    <TitledContainer title='Login' icon={<FontAwesomeIcon icon={faSignInAlt} />}>
                        <LoginPanel />
                    </TitledContainer>
                </section>
            )
        }

        return null;
    }
}

export default Login;