import React from 'react';
import PropTypes from 'prop-types';

const Badge = props => {
    let items = props.items.map((item, i) => {
        return <div key={i} className='badge-body'>{item.text}</div>
    });

    return(
        <div className={`badge ${props.className}`}>
            <div className='badge-header'></div>

            {items}
        </div>
    )
}

Badge.propTypes = {
    className: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired
};

export default Badge;