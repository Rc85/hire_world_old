import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

class Loading extends Component {
    render() {
        return(
            <div className='loading-container'>
                <div className='loading'>
                    <FontAwesomeIcon icon={faCircleNotch} size={this.props.size} spin />
                </div>
            </div>
        )
    }
}

export default Loading;