import React from 'react';
import PropTypes from 'prop-types';

const Badge = props => {
    return(
        <div className={`badge ${props.className ? props.className : ''}`}>
            <div className={`badge-text ${props.count <= 1 ? 'no-counter': ''}`}>{props.text}</div>
            {props.count > 1 ? <div className={`badge-counter ${props.counterClassName ? props.counterClassName : ''}`}>+{props.count}</div> : ''}
        </div>
    )
}

Badge.propTypes = {
    className: PropTypes.string,
    text: PropTypes.string,
    count: PropTypes.number
};

export default Badge;