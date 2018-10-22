import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Alert extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.status !== null) {
            setTimeout(() => {
                this.props.unmount();
            }, 4000);
        }
    }

    render() {
        let alertClass;
        let message;

        if (/success$/.test(this.props.status)) {
            alertClass = 'alert-success';
            message = 'Updated';
        } else if (/error$/.test(this.props.status)) {
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
    status: PropTypes.string.isRequired,
    message: PropTypes.string,
    unmount: PropTypes.func,
    left: (props, propName, componentName) => {
        if (props['left'] && !/^[0-9]*(px|%)$/.test(props['left'])) {
            return new Error(`Invalid value supplied to props '${propName} for component '${componentName}`);
        }
    },
    top: (props, propName, componentName) => {
        if (props['top'] && !/^[0-9]*(px|%)$/.test(props['top'])) {
            return new Error(`Invalid value supplied to props '${propName} for component '${componentName}`);
        }
    }
}