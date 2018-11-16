import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import RegisterForm from '../includes/page/RegisterForm';
import Response from '../pages/Response';

class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: '',
            statusMessage: ''
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.key !== this.props.location.key) {
            this.setState({status: '', statusMessage: ''});
        }
    }
    
    render() {
        let component = <RegisterForm callback={(status, message) => this.setState({status: status, statusMessage: message})}/>;

        if (this.state.status === 'success') {
            component = <Response code={200} header='Success!' message='You are registered. Please check your email to confirm your registration.' />;
        }

        if (this.props.user.user) {
            return(
                <Redirect to='/dashboard/edit' />
            )
        } else {
            return(
                <div>
                    { component }
                </div>
            )
        }
    }
}

export default withRouter(Register);