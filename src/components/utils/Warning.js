import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CloseWarning } from '../../actions/WarningActions';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

class Warning extends Component {
    componentDidMount() {
        let modal = document.getElementById('warning-modal');
        modal.style.top = `${window.pageYOffset}px`;
        document.body.style.overflowY = 'hidden';
    }

    componentWillUnmount() {
        document.body.style.overflowY = 'auto';
    }

    render() {
        return (
            <div id='warning-modal' className='full-black-overlay'>
                <div className='modal-container rounded'>
                    <div className='modal-text d-flex mb-3'>
                        <div><FontAwesomeIcon icon={faExclamationTriangle} color='#ffc107' size='3x' /></div>
                        <div>{this.props.message}</div>
                    </div>

                    <div className='text-right'>
                        <button className='btn btn-primary' onClick={() => this.props.dispatch(CloseWarning())}>Ok</button>
                    </div>
                </div>
            </div>
        );
    }
}

Warning.propTypes = {
    message: PropTypes.string.isRequired
};

export default connect()(Warning);