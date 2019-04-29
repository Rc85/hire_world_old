import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from '../utils/Loading';
import fetch from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList } from '@fortawesome/pro-solid-svg-icons';
import TitledContainer from '../utils/TitledContainer';
import { Redirect } from 'react-router-dom';
import { LogError } from '../utils/LogError';
import JobTimeline from '../includes/page/JobTimeline';
import InputWrapper from '../utils/InputWrapper';
import MoneyFormatter from '../utils/MoneyFormatter';

class JobSummary extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading'
        }
    }
    
    componentDidMount() {
        fetch.post('/api/jobs/summary', {type: 'all'})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', summary: resp.data});
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

            fetch.post('/api/jobs/summary', {type: 'jobs', year: year})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let summary = {...this.state.summary};
                    summary['jobs'] = resp.data.jobs

                    this.setState({status: '', summary: summary});
                } else if (resp.data.status === 'error') {
                    this.setState({status: 'error'});
                }
            })
            .catch(err => {
                LogError(err, '/api/jobs/summary');
                this.setState({status: 'error'});
            });
        } else {
            let summary = {...this.state.summary};
            summary['jobs'] = null;

            this.setState({summary: summary});
        }
    }
    
    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        }
        
        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        } else if (this.state.status === 'error') {
            return <Redirect to='/error/app/500' />;
        }

        if (this.props.user.user && this.state.summary) {
            let status, appFee, userFee, clientFee;

            if (this.state.summary.user_app_fee && !isNaN(parseFloat(this.state.summary.user_app_fee))) {
                userFee = parseFloat(this.state.summary.user_app_fee);
            } else {
                userFee = 0;
            }

            if (this.state.summary.client_app_fee && !isNaN(parseFloat(this.state.summary.client_app_fee))) {
                clientFee = parseFloat(this.state.summary.client_app_fee);
            } else {
                userFee = 0;
            }

            appFee = userFee + clientFee

            return (
                <section id='jobs' className='main-panel'>
                    <TitledContainer title='Job Summary' bgColor='orange' icon={<FontAwesomeIcon icon={faClipboardList} />}>
                        {status}

                        <div className='simple-container no-bg'>
                            <div className='simple-container-title'>Stats</div>

                            <div className='job-summary-stats-container'>
                                <div className='job-summary-stats'>
                                    <strong>Total Jobs:</strong> {this.state.summary.stats.total_jobs ? this.state.summary.stats.total_jobs : 0}
                                </div>

                                <div className='job-summary-stats'>
                                    <strong>Jobs Complete:</strong> {this.state.summary.stats.job_complete ? this.state.summary.stats.job_complete : 0}
                                </div>

                                <div className='job-summary-stats'>
                                    <strong>Jobs Abandoned:</strong> {this.state.summary.stats.job_abandoned ? this.state.summary.stats.job_abandoned : 0}
                                </div>

                                <div className='job-summary-stats'>
                                    <strong>Jobs Declined:</strong> {this.state.summary.stats.job_declined ? this.state.summary.stats.job_declined : 0}
                                </div>
                            </div>
                        </div>

                        <div className='simple-container no-bg'>
                            <div className='simple-container-title'>Payments</div>

                            <div className='job-summary-stats mb-1'>
                                <strong>Total Payment for Services:</strong> {!this.state.summary.total_payment.total_payment ? <span>$0</span> : <span>$<MoneyFormatter value={this.state.summary.total_payment.total_payment} /> {this.state.summary.total_payment.job_price_currency}</span>}
                            </div>

                            <div className='job-summary-stats mb-1'>
                                <strong>Total Application Fees Paid:</strong> {!isNaN(appFee) ? <span>$<MoneyFormatter value={appFee} /></span> : <span>$0</span>} CAD
                            </div>
                        </div>

                        <div className='simple-container no-bg'>
                            <div className='simple-container-title'>Income</div>

                            <div className='job-summary-stats mb-1'>
                                <strong>Total Earnings:</strong> {!this.state.summary.payout_received ? <span>$0</span> : <span>$<MoneyFormatter value={this.state.summary.payout_received} /></span>}
                            </div>

                            <div className='job-summary-stats mb-1'>
                                <strong>Funds Available Soon:</strong> {!this.state.summary.balance_pending ? <span>$0</span> : <span>$<MoneyFormatter value={this.state.summary.balance_pending} /></span>}
                            </div>

                            <div className='job-summary-stats mb-1'>
                                <strong>Funds Available for Payout:</strong> {!this.state.summary.balance_available ? <span>$0</span> : <span>$<MoneyFormatter value={this.state.summary.balance_available} /></span>}
                            </div>
                        </div> 

                        <div className='simple-container no-bg'>
                            <div className='simple-container-title'>Job History</div>

                            <JobTimeline status={this.state.status} jobs={this.state.summary.jobs} getJobs={(year) => this.getJobs(year)} years={this.state.summary.job_years} />
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