import React from 'react';
import PropTypes from 'prop-types';
import TitledContainer from './utils/TitledContainer';
import moment from 'moment';
import Username from './Username';

const ViewUserJobActivities = props => {
    if (props.user) {
        if (props.jobs.length > 0) {
            return(
                <TitledContainer title='Recent Job Activities' className='mb-5' mini shadow>
                    {props.jobs.map((job, i) => {
                        let badgeClass;

                        if (job.job_stage === 'Completed') {
                            badgeClass = 'success';
                        } else if (job.job_stage === 'Abandoned') {
                            badgeClass = 'danger';
                        }

                        return <div key={i} className='view-user-job-activity-row'>
                            <span className={`mini-badge mini-badge-${badgeClass} outline`}>Job {job.job_stage}</span> on {moment(job.job_end_date).format('MMM-DD-YYYY')} with <Username username={job.job_client} right />
                            {i === props.jobs.length - 1 ? '' : <hr />}
                        </div>
                    })}
                </TitledContainer>
            )
        }
    }

    return null;
}

ViewUserJobActivities.propTypes = {
    user: PropTypes.object
};

export default ViewUserJobActivities;