import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
import PropTypes from 'prop-types';

export default class Loading extends Component {
    render() {
        return(
            <div className={`loading-container ${this.props.className ? this.props.className : ''}`}>
                <FontAwesomeIcon icon={faCircleNotch} size={this.props.size} spin color={this.props.color} />
                <h3 className={this.props.color === 'black' ? 'text-black' : ''}>{this.props.text}</h3>
            </div>
        )
    }
}

Loading.defaultProps = {
    size: '1x'
}

Loading.propTypes = {
    size: (props) => {
        if (!/^(([1-9]|10)x|xs|sm|lg)$/.test(props['size'])) {
            return new Error('Incorrect size input (eg. - "2x", "3x", "lg")');
        }
    },
    background: PropTypes.bool
}