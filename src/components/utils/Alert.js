import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../../styles/Alert.css';
import { connect } from 'react-redux';

class Alert extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let alert = document.getElementById('alert');

        if (this.props.status !== null) {
            alert.style.display = 'block';
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

            setTimeout(() => {
                alert.style.display = 'none';
            }, 2250);
        }
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
        }

        if (this.props.message) {
            message = this.props.message;
        }

        return(
            <div id='alert' className={alertClass}>
                {message}
            </div>
        )
    }
}

Alert.propTypes = {
    status: PropTypes.oneOf(['success', 'error']).isRequired,
    message: PropTypes.string,
    left: (props, propName, componentName) => {
        if (props['left'] && !/^[0-9]*px$/.test(props['left'])) {
            return new Error(`Invalid value supplied to props '${propName} for component '${componentName}`);
        }
    },
    top: (props, propName, componentName) => {
        if (props['top'] && !/^[0-9]*px$/.test(props['top'])) {
            return new Error(`Invalid value supplied to props '${propName} for component '${componentName}`);
        }
    }
}

export default connect()(Alert);