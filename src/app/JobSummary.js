import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from '../components/utils/Loading';
import fetch from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList } from '@fortawesome/pro-solid-svg-icons';
import TitledContainer from '../components/utils/TitledContainer';
import { Redirect } from 'react-router-dom';
import { LogError } from '../components/utils/LogError';
import JobTimeline from '../components/JobTimeline';
import MoneyFormatter from '../components/utils/MoneyFormatter';

class JobSummary extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading'
        }
    }
    
    componentDidMount() {
        fetch.post('/api/jobs/summary')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', ...resp.data});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/jobs/summary');
            this.setState({status: 'error'});
        });
    }

    getJobs(year) {
        if (year) {
            this.setState({status: 'Getting Jobs'});

            fetch.post('/api/get/jobs/summary', {year: year})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', jobs: resp.data.jobs});
                } else if (resp.data.status === 'error') {
                    this.setState({status: 'error'});
                }
            })
            .catch(err => {
                LogError(err, '/api/jobs/summary');
                this.setState({status: 'error'});
            });
        } else {
            return;
        }
    }
    
    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        } else if (this.state.status === 'Loading') {
            return <Loading size='7x' color='black' />;
        } else if (this.state.status === 'error') {
            return <Redirect to='/error/app/500' />;
        }

        if (this.props.user.user) {
            let appFee, userFee, clientFee;

            if (this.state.user_app_fee && !isNaN(parseFloat(this.state.user_app_fee))) {
                userFee = parseFloat(this.state.user_app_fee);
            } else {
                userFee = 0;
            }

            if (this.state.client_app_fee && !isNaN(parseFloat(this.state.client_app_fee))) {
                clientFee = parseFloat(this.state.client_app_fee);
            } else {
                userFee = 0;
            }

            appFee = userFee + clientFee

            return (
                <section id='jobs' className='main-panel'>
                    <TitledContainer title='Job Summary' bgColor='orange' icon={<FontAwesomeIcon icon={faClipboardList} />}>
                        <div className='simple-container no-bg'>
                            <div className='simple-container-title'>Stats</div>

                            <div className='job-summary-stats-container'>
                                <div className='job-summary-stats'>
                                    <strong>Total Jobs:</strong> {this.state.stats.total_jobs ? this.state.stats.total_jobs : 0}
                                </div>

                                <div className='job-summary-stats'>
                                    <strong>Jobs Complete:</strong> {this.state.stats.job_complete ? this.state.stats.job_complete : 0}
                                </div>

                                <div className='job-summary-stats'>
                                    <strong>Jobs Abandoned:</strong> {this.state.stats.job_abandoned ? this.state.stats.job_abandoned : 0}
                                </div>

                                <div className='job-summary-stats'>
                                    <strong>Jobs Declined:</strong> {this.state.stats.job_declined ? this.state.stats.job_declined : 0}
                                </div>
                            </div>
                        </div>

                        <div className='simple-container no-bg'>
                            <div className='simple-container-title'>Paid</div>

                            <div className='job-summary-stats mb-3'>
                                <div className='mb-1'><strong>Total Payment for Services:</strong></div>
                                <div className='job-summary-price-container ml-3'>
                                    {this.state.finance.map((job, i) => {
                                        return <div key={i} className='mr-3'>
                                            {!job.total_payment ? <span>$0.00</span> : <span>$<MoneyFormatter value={job.total_payment} /></span>} {job.currency}
                                        </div>
                                    })} 
                                </div>
                            </div>

                            <div className='job-summary-stats mb-3'>
                                <div className='mb-1'><strong>Total Application Fees Paid:</strong></div>
                                <div className='job-summary-price-container ml-3'>
                                    {this.state.finance.map((obj, i) => {
                                        let userFee = obj.total_user_fee ? obj.total_user_fee : 0;
                                        let clientFee = obj.total_client_fee ? obj.total_client_fee : 0;
                                        return <div key={i} className='mr-3'>
                                            <span>$<MoneyFormatter value={userFee + clientFee} /> {obj.currency}</span>
                                        </div>
                                    })} 
                                </div>
                            </div>
                        </div>

                        <div className='simple-container no-bg'>
                            <div className='simple-container-title'>Earned</div>

                            <div className='job-summary-stats mb-3'>
                                <div className='mb-1'><strong>Total Earnings:</strong></div>
                                <div className='job-summary-price-container ml-3'>
                                    {this.state.finance.map((obj, i) => {
                                        return <div key={i} className='mr-3'>
                                            <span>$<MoneyFormatter value={obj.total_earnings} /> {obj.currency}</span>
                                        </div>
                                    })} 
                                </div>
                            </div>

                            <div className='job-summary-stats mb-3'>
                                <div className='mb-1'><strong>Funds Available Soon:</strong></div>
                                <div className='job-summary-price-container ml-3'>
                                    {Object.keys(this.state.balance_pending).length > 0 ? Object.keys(this.state.balance_pending).map((key, i) => {
                                        return <div key={i}>$<MoneyFormatter value={this.state.balance_pending[key] / 100} /> {key.toUpperCase()}</div>
                                    }) : 'N/A'} 
                                </div>
                            </div>

                            <div className='job-summary-stats mb-3'>
                                <div className='mb-1'><strong>Funds Available for Payout:</strong></div>
                                <div className='d-flex ml-3'>
                                {Object.keys(this.state.balance_available).length > 0 ? Object.keys(this.state.balance_available).map((key, i) => {
                                        return <div key={i}>$<MoneyFormatter value={this.state.balance_available[key] / 100} /> {key.toUpperCase()}</div>
                                    }) : 'N/A'} 
                                </div>
                            </div>
                        </div> 

                        <div className='simple-container no-bg'>
                            <div className='simple-container-title'>Job History</div>

                            <JobTimeline status={this.state.status} jobs={this.state.jobs} getJobs={(year) => this.getJobs(year)} years={this.state.job_years} />
                        </div>
                    </TitledContainer>
                </section>
            );
        }

        return <Loading size='7x' color='black' />;
    }
}

JobSummary.propTypes = {

};

export default JobSummary;