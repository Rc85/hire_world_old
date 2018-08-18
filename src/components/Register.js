import React, { Component } from 'react';
import '../styles/Register.css';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import Response from './Response';

class Register extends Component {
    render() {
        let message;
        let component;

        if (this.props.status === 'register error') {
            message = <div className='alert alert-danger' role='alert'>An error occurred</div>;
            component = <RegisterForm />;
        } else if (this.props.status === 'register success') {
            message = <div className='alert alert-success' role='alert'>Registration successful</div>;
            component = <Response code={200} header='Success!' message='You are registered. Please check your email to confirm your registration' />;
        }

        return(
            <section id='register-form' className='blue-panel shallow' style={this.props.show ? {display: 'block'} : {display: 'none'}}>
                {message}

                { component }
            </section>
        )
    }
}

const mapStateToProps = state => {
    return {
        status: state.Register.status
    }
}

export default withRouter(connect(mapStateToProps)(Register));