import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { UncontrolledTooltip } from 'reactstrap';
import moment from 'moment';
import UserRating from './UserRating';

const ViewUserStats = props => {
    let businessHours;
    let time = [];

    for (let day in props.hours) {
        time.push(
            <div key={day} className='d-flex'>
                <div className='w-25'>{day.charAt(0).toUpperCase() + day.substring(1,3)}</div>
                <div>{props.hours[day]}</div>
            </div>
        )
    }

    if (time.length > 0) {
        businessHours = <React.Fragment>
            <h5>Business Hours</h5>

            <div className='mb-1'>{time}</div>

            <hr/>
        </React.Fragment>
    }

    return(
        <div id='view-user-business-hours'>
            {businessHours}
        </div>
    )
}

ViewUserStats.propTypes = {
    
};

export default ViewUserStats;