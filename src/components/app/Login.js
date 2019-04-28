import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Loading from '../utils/Loading';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/pro-solid-svg-icons';
import LoginPanel from '../includes/site/LoginPanel';

class Login extends Component {
    render() {
        if (this.props.user.status === 'success' && this.props.user.user) {
            return <Redirect to='/dashboard/edit' />;
        } else if (this.props.user.status === 'getting session') {
            return <Loading size='7x' />;
        } else if (this.props.user.status === 'error' || this.props.user.status === 'not logged in' || this.props.user.status === 'access error') {
            return(
                <section id='login'>
                    <div>
                        <TitledContainer title='Login' icon={<FontAwesomeIcon icon={faSignInAlt} />}>
                            <LoginPanel />
                        </TitledContainer>
                    </div>
                </section>
            )
        }

        return null;
    }
}

export default Login;