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

        if (this.props.status === 'success') {
            alertClass = 'alert-success';
            message = 'Updated';
        } else if (this.props.status === 'error') {
            alertClass = 'alert-error';
            message = 'An error occurred';
        } else if (this.props.status === 'fail') {
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