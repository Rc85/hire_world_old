import React, { Component } from 'react';
import '../styles/Alert.css';
import { connect } from 'react-redux';

class Alert extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        console.log('alert component mounted');
        let alert = document.getElementById('alert');

        if (this.props.status !== null) {
            alert.style.opacity = 1;

            if (this.props.left) {
                alert.style.left = this.props.left;
            }

            if (this.props.top) {
                alert.style.top = this.props.top;
            }

            setTimeout(() => {
                alert.style.opacity = 0;
            }, 2000);
        }
    }

    componentWillUnmount() {
        console.log('component will unmount');
    }

    render() {
        let alertClass;
        let message;
        let success = /success$/;
        let fail = /fail$/;
        let error = /error$/;

        if (success.test(this.props.status)) {
            alertClass = 'alert-success';
            message = 'Updated';
        } else if (error.test(this.props.status)) {
            alertClass = 'alert-error';
            message = 'An error occurred';
        } else if (fail.test(this.props.status)) {
            alertClass = 'alert-error';
            message = 'Failed';
        }

        return(
            <div id='alert' className={alertClass}>
                {message}
            </div>
        )
    }
}

export default connect()(Alert);