import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faExclamationCircle } from '@fortawesome/pro-solid-svg-icons';

const StaticAlert = props => {
    let icon;

    if (props.status === 'danger') {
        icon = <FontAwesomeIcon icon={faExclamationTriangle} size='lg' className='static-alert-icon' />;
    } else if (props.status === 'warning') {
        icon = <FontAwesomeIcon icon={faExclamationCircle} size='lg' className='static-alert-icon' />;
    }

    return(
        <div className={`static-alert static-alert-${props.status}`}>
            <div className='static-alert-icon-container'>{icon}</div>
            <div className='static-alert-text'>{props.text}</div>
        </div>
    )
}

StaticAlert.propTypes = {
    status: PropTypes.string,
    text: PropTypes.string
};

export default StaticAlert;