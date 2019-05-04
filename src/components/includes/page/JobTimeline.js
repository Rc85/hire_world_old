import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import InputWrapper from '../../utils/InputWrapper';
import JobTimelineDetails from './JobTimelineDetails';
import Loading from '../../utils/Loading';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/pro-solid-svg-icons';

class JobTimeline extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showTooltip: false,
            tooltipY: null
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        let next = JSON.stringify(nextProps.jobs);
        let current = JSON.stringify(this.props.jobs);

        if (next !== current) {
            return true;
        }

        return true;
    }
    
    getJobDetails(job) {
        this.jobDetails.scrollIntoView({behavior: 'smooth', block: 'nearest'});

        this.setState({jobDetails: job});
    }
    
    render() {
        console.log(this.props.jobs)
        let status, monthDiv;

        if (this.props.status === 'Getting Jobs') {
            status = <div className='p-relative mt-5 mb-5'><Loading size='5x' /></div>;
        }

        let months = [
            {name: 'Jan', jobs: {}},
            {name: 'Feb', jobs: {}},
            {name: 'Mar', jobs: {}},
            {name: 'Apr', jobs: {}},
            {name: 'May', jobs: {}},
            {name: 'Jun', jobs: {}},
            {name: 'Jul', jobs: {}},
            {name: 'Aug', jobs: {}},
            {name: 'Sep', jobs: {}},
            {name: 'Oct', jobs: {}},
            {name: 'Nov', jobs: {}},
            {name: 'Dec', jobs: {}}
        ]

        if (this.props.jobs) {
            months.map((month, i) => {
                for (let obj of this.props.jobs) {
                    for (let job of obj.jobs) {
                        let jobMonth = moment(job.job_end_date).month();
                        let jobDay = moment(job.job_end_date).format('DD');

                        if (i === jobMonth) {
                            if (months[i].jobs[jobDay]) {
                                months[i].jobs[jobDay].push(job);
                            } else {
                                months[i].jobs[jobDay] = [job];
                            }
                        }
                    }

                    let sorted = {};

                    Object.keys(months[i].jobs).sort().forEach((key) => {
                        return sorted[key] = months[i].jobs[key];
                    });

                    months[i].jobs = sorted;
                }
            });

            console.log(months);

            monthDiv = months.map((month, i) => {
                let jobs = [];

                for (let date in month.jobs) {
                    let monthObj = <div key={date} className='job-timeline-month-job-div-container'>
                        <div className='job-timeline-job-dot'></div>
                        
                        <div className='job-timeline-jobs-list'>
                            <h5><span>{date}</span></h5>
    
                            {month.jobs[date].map((job) => {
                                return <div key={job.job_id} className='job-timeline-month-job-div'>
                                    <FontAwesomeIcon icon={faCircle} size='xs' className={this.props.user.user.username === job.job_user ? 'text-violet' : 'text-orange'} /> <strong onClick={() => this.getJobDetails(job)}>{job.job_title}</strong>
                                </div>
                            })}
                        </div>
                    </div>

                    jobs.push(monthObj);
                }

                return <div key={month.name} className='job-timeline-month'>
                    <div className='d-flex-center mb-2'>
                        <div className='job-timeline-month-dot'></div>
                        <span>{month.name}</span>
                    </div>

                    {jobs}
                </div>
            });
        }

        //console.log(months[4].jobs);

        return (
            <div id='job-timeline'>
                <div className='d-flex-between-start'>
                    <div className='job-timeline-container'>
                        <div className='mb-3'>
                            <InputWrapper label='Select Year'>
                                <select onChange={(e) => this.props.getJobs(e.target.value)}>
                                    <option value=''>Select Year</option>
                                    {this.props.years.map((year) => { return <option key={year.year} value={year.year}>{year.year}</option>})}
                                </select>
                            </InputWrapper>
                        </div>

                        {status}
    
                        <div id='job-timeline-month-container' className={this.props.jobs ? 'show' : ''}>
                            {monthDiv}
                        </div>      
                    </div>

                    <div className='w-50' ref={e => this.jobDetails = e}>{this.state.jobDetails ? <JobTimelineDetails job={this.state.jobDetails} /> : ''}</div>
                </div>
            </div>
        );
    }
}

JobTimeline.propTypes = {

};

const mapStateToProps = state => {
    return {
        user: state.Login
    }
}

export default connect(mapStateToProps)(JobTimeline);