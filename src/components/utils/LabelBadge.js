import React from 'react';
import PropTypes from 'prop-types';

const LabelBadge = props => {
    return(
        <div className='label-badge'>
            <div className='label-badge-title'>{props.label}</div>
            <div className={`label-badge-text bg-${props.status} border-${props.status} ${props.status === 'warning' ? 'text-black' : ''}`}>{props.text}</div>
        </div>
    )
}

LabelBadge.propTypes = {
    label: PropTypes.string,
    text: PropTypes.string
};

export default LabelBadge;