import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

export default class Loading extends Component {
    render() {
        return(
            <div className='loading-container' style={this.props.background ? {background: `rgba(0, 0, 0, 0.5)`} : {background: 'transparent'}}>
                <div className='loading'>
                    <FontAwesomeIcon icon={faCircleNotch} size={this.props.size} spin />
                </div>
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