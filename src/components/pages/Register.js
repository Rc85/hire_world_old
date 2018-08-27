import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import RegisterForm from '../includes/page/RegisterForm';
import Response from '../pages/Response';
import { Alert } from 'reactstrap';

class Register extends Component {
    render() {
        let message;
        let component = <RegisterForm />;

        if (this.props.status === 'register error') {
            message = <Alert color='danger'>An error occurred</Alert>;
        } else if (this.props.status === 'register success') {
            message = <Alert color='success'>Registration successful</Alert>;
            component = <Response code={200} header='Success!' message='You are registered. Please check your email to confirm your registration.' />;
        }

        if (this.props.user) {
            return(
                <Redirect to='/dashboard/edit' />
            )
        } else {
            return(
                <div>
                    {message}

                    { component }
                </div>
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