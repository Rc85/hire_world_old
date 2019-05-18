import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Username from './Username';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import MoneyFormatter from './utils/MoneyFormatter';

class JobTimelineDetails extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showDetails: false
        }
    }
    
    componentDidMount() {
        setTimeout(() => {
            this.setState({showDetails: true});
        }, 250);
    }

    close() {
        this.setState({showDetails: false});
        
        setTimeout(() => {
            this.props.close();
        }, 500);
    }
    
    render() {
        return (
            <div id='job-timeline-month-detail' className={`simple-container no-bg ${this.state.showDetails ? 'show' : ''}`}>
                <div className='simple-container-title'>{this.props.job.job_title}</div>

                <div className='d-flex-between-start mb-3'>
                    <div>
                        {this.props.job.token_status === 'Invalid' ? <span className='mini-badge mini-badge-success'>Reviewed</span> : ''}
                    </div>
                    
                    <div>
                        {this.props.user.user.username === this.props.job.job_user ? <strong>Client:</strong> : <strong>Service Provider:</strong>} <Username username={this.props.user.user.username === this.props.job.job_user ? this.props.job.job_client : this.props.job.job_user} color={'alt-highlight'} right />
                    </div>
                </div>

                <div className='job-timeline-detail-container mb-3'>
                    {this.props.job.job_end_date ? <div className='job-timeline-detail'><strong>Job Completed Date: </strong> {moment(this.props.job.job_end_date).format('MM-DD-YYYY')}</div> : ''}

                    {this.props.job.job_due_date ? <div className='job-timeline-detail'><strong>Expected Delivery Date:</strong> {moment(this.props.job.job_due_date).format('MM-DD-YYYY')}</div> : ''}

                    {this.props.job.job_offer_price ? <div className='job-timeline-detail'><strong>Offered Price:</strong> {isNaN(this.props.job.job_offer_price) ? <span>$0</span> : <span>$<MoneyFormatter value={this.props.job.job_offer_price} /></span>}</div> : ''}

                    <div className='job-timeline-detail'><strong>Job Price: </strong> $<MoneyFormatter value={this.props.job.job_total_price} /> {this.props.job.job_price_currency}</div>

                    {this.props.user.user.username === this.props.job.job_client ? <div className='job-timeline-detail'><strong>Application Fee:</strong> $<MoneyFormatter value={this.props.job.total_client_fee} /> {this.props.job.job_price_currency}</div> : ''}

                    {this.props.user.user.username === this.props.job.job_user ? <div className='job-timeline-detail'><strong>Application Fee:</strong> $<MoneyFormatter value={this.props.job.total_user_fee} /> {this.props.job.job_price_currency}</div> : ''}

                    <div className='job-timeline-detail'><strong>Payout:</strong> $<MoneyFormatter value={this.props.job.total_payment} /> {this.props.job.job_price_currency}</div>

                    <div className='job-timeline-detail'><strong>Milestones:</strong> {this.props.job.milestone_count}</div>
                </div>

                <div className='simple-container no-bg mb-3'>
                    <div className='simple-container-title'>Job Description</div>

                    <div className='keep-format'>{this.props.job.job_description}</div>
                </div>

                <div className='text-right'>
                    <span className='mr-2'><NavLink to={`/dashboard/job/details/${this.props.job.job_status.toLowerCase()}/${this.props.job.job_id}`}>View Job</NavLink></span>
                    <span className='job-summary-details-link' onClick={this.close.bind(this)}>Close</span>
                </div>

                <div className='text-right'><small className='text-dark'>Job ID: {this.props.job.job_id}</small></div>
            </div>
        );
    }
}

JobTimelineDetails.propTypes = {
    job: PropTypes.object
};

const mapStateToProps = state => {
    return {
        user: state.Login
    }
}

export default connect(mapStateToProps)(JobTimelineDetails);