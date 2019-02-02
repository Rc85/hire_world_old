import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'axios';
import { LogError } from '../../utils/LogError';
import InputWrapper from '../../utils/InputWrapper';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faBan } from '@fortawesome/free-solid-svg-icons';

class UserWorkHistory extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: '',
            startYear: '',
            endYear: '',
            showYear: '',
            history: [],
            years: [],
            months: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
            showing: ''
        }
    }
    
    /* shouldComponentUpdate(nextProps, nextState) {
        if (this.state.showYear === nextState.showYear) {
            return false;
        }

        return true;
    } */

    componentDidMount() {
        this.setState({status: 'Loading'});

        fetch.post('/api/get/user/job-years', {user: this.props.user})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', years: resp.data.years});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/user/job-years');
            this.setState({status: 'error', statusMessage: 'An error occurred while retrieving job years'});
        });
    }
    
    getWorkHistory(year) {
        this.setState({status: 'Loading'});

        fetch.post('/api/get/user/work-history', {user: this.props.user, date: year})
        .then(resp => {
            if (resp.data.status === 'success') {
                let startDate = new Date(resp.data.history[0].job_end_date);
                let startYear = startDate.getUTCFullYear();
                let endDate = new Date(resp.data.history[resp.data.history.length - 1].job_end_date);
                endDate.setUTCFullYear(endDate.getUTCFullYear() + 1);
                let endYear = endDate.getUTCFullYear();

                this.setState({status: '', history: resp.data.history, startYear: startYear, endYear: endYear});
            } else if (resp.data.status === 'error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/user/work-history');
            this.setState({status: 'error', statusMessage: 'An error occurred while retrieve work history'});
        });
    }
    
    render() {
        if (this.state.status === 'error') {
            return <div id='view-user-work-history' className='text-center'>
                <h3 className='text-dark'>{this.state.statusMessage}</h3>
            </div>
        }

        return (
            <div id='view-user-work-history' className='mb-3'>
                <InputWrapper label='Show Year'>
                    <select onChange={(e) => this.getWorkHistory(e.target.value)}>
                        <option value=''>Select a year</option> 
                        {this.state.years.map((year, i) => {
                            return <option key={i} value={year}>{year}</option>
                        })}
                    </select>
                </InputWrapper>

                <div id='timeline'>
                    <div id='timeline-start-year-node'>
                        <div id='start-node-container'>
                            <div id='start-node' title={this.state.startYear ? this.state.startYear : ''}></div>
                        </div>
                    </div>
                    
                    <div id='timeline-bar'>
                        {this.state.months.map((month, monthIndex) => {
                            let innerContent = [];

                            for (let i = 0; i < this.state.history.length; i++) {
                                let monthNumber = new Date(this.state.history[i].job_end_date).getMonth();

                                if (monthNumber === monthIndex) {
                                    innerContent.push(
                                        <div key={this.state.history[i].job_id} className={`month-detail`}>
                                            <small className='text-black'>{this.state.history[i].job_stage === 'Completed' ? <FontAwesomeIcon icon={faCheckCircle} className='text-success' /> : <FontAwesomeIcon icon={faBan} className='text-danger' />} Job {this.state.history[i].job_stage} with {this.state.history[i].job_client} on {moment(this.state.history[i].job_end_date).format('YYYY-MM-DD')}</small>
                                        </div>
                                    );
                                }
                            }

                            return <div id={month} key={monthIndex} className={`timeline-months ${innerContent.length > 0 ? 'bg-hightlight' : 'bg-light'}`} onMouseOver={() => this.setState({showing: month})} onMouseOut={() => this.setState({showing: ''})}><small className={`timeline-month-text ${innerContent.length > 0 ? '' : 'text-black'}`}>{month.charAt(0).toUpperCase() + month.substring(1)}</small> {innerContent.length > 0 ? <div className={`month-detail-wrapper ${this.state.showing === month ? 'show' : ''}`}><div className='month-detail-container'>{innerContent}</div></div> : ''}</div>
                        })}
                    </div>

                    <div id='timeline-end-year-node'>
                        <div id='end-node-container'>
                            <div id='end-node' title={this.state.endYear ? this.state.endYear : ''}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

UserWorkHistory.propTypes = {

};

export default UserWorkHistory;