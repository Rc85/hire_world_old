import React, { Component } from 'react';
import '../../styles/Register.css';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import RegisterForm from '../includes/page/RegisterForm';
import Response from '../pages/Response';

class Register extends Component {
    render() {
        let message;
        let component = <RegisterForm />;

        if (this.props.status === 'register error') {
            message = <div className='alert alert-danger' role='alert'>An error occurred</div>;
        } else if (this.props.status === 'register success') {
            message = <div className='alert alert-success' role='alert'>Registration successful</div>;
            component = <Response code={200} header='Success!' message='You are registered. Please check your email to confirm your registration' />;
        }

        if (this.props.user) {
            location.href = '/dashboard';
        } else {
            return(
                <section id='register-form' className='main-panel w-75'>
                    <div className='blue-panel shallow rounded w-100'>
                        {message}

                        { component }
                    </div>
                </section>
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        status: state.Register.status,
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(Register));