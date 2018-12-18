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
        <div id='view-user-stats'>
            {businessHours}

            <h5>Stats</h5>

            <div className='d-flex mb-2'>
                <div className='mr-1'>
                    <UserRating rating={props.stats.rating || 0} />
                </div>

                <div>({props.stats.job_count} Reviews)</div>
            </div>

            <div className='d-flex mb-1'>
                <div className='mr-2'>
                    <FontAwesomeIcon icon={faCheckCircle} className='text-success' id='job-success' />
                    <UncontrolledTooltip placement='top' target='job-success' delay={{show: 0, hide: 0}}>Job Completed</UncontrolledTooltip>
                </div>
                <span>{props.stats.job_complete}</span>
            </div>

            <div className='d-flex mb-1'>
                <div className='mr-2'>
                    <FontAwesomeIcon icon={faTimesCircle} className='text-danger' id='job-abandon' />
                    <UncontrolledTooltip placement='top' target='job-abandon' delay={{show: 0, hide: 0}}>Job Abandoned</UncontrolledTooltip>
                </div>
                <span>{props.stats.job_abandon}</span>
            </div>

            <div className='d-flex mb-1'>
                <div className='mr-2'>
                    <FontAwesomeIcon icon={faEye} id='user-views' />
                    <UncontrolledTooltip placement='top' target='user-views' delay={{show: 0, hide: 0}}>Views</UncontrolledTooltip>
                </div>
                <span>{props.stats.view_count ? props.stats.view_count : '0'}</span>
            </div>

            {props.stats.user_last_login ? 
            <React.Fragment>
                <hr/>
                <div className='d-flex-between-start'>
                    <h5>Last Login</h5>
                    {moment(props.stats.user_last_login).format('MM-DD-YY @ hh:mm A')}
                </div>
                <hr/>
            </React.Fragment> : ''}
        </div>
    )
}

ViewUserStats.propTypes = {
    
};

export default ViewUserStats;