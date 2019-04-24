import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/pro-solid-svg-icons';

class GlobalLoading extends Component {
    componentDidMount() {
        document.body.style.overflowY = 'hidden';
    }

    componentWillUnmount() {
        document.body.style.overflowY = '';
    }
    
    render() {
        return (
            <div id='global-loading' style={{top: `${window.pageYOffset}px`, left: '0'}} className='full-black-overlay'>
                <div className='global-loading-container'>
                    <div className='mb-2'><FontAwesomeIcon icon={faCircleNotch} spin size='7x' /></div>
                    <span>{this.props.text}</span>
                </div>
            </div>
        );
    }
}

GlobalLoading.propTypes = {

};

export default GlobalLoading;