import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faCaretDown, faCaretUp, faCircleNotch, faQuestionSquare, faTimesSquare } from '@fortawesome/pro-solid-svg-icons';
import { faSquare } from '@fortawesome/pro-regular-svg-icons';
import moment from 'moment';
import fetch from 'axios';
import { Alert } from '../actions/AlertActions';
import { connect } from 'react-redux';
import { ShowConfirmation, ResetConfirmation } from '../actions/ConfirmationActions';
import VerifyPayment from './VerifyPayment';
import { StripeProvider, Elements } from 'react-stripe-elements';
import { LogError } from './utils/LogError';
import SubmitButton from './utils/SubmitButton';
import download from 'js-file-download';
import MoneyFormatter from './utils/MoneyFormatter';

class MilestoneTrackingRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            startMilestone: false,
            showDetails: this.props.milestone.milestone_status === 'In Progress',
            showMilestoneDetails: this.props.milestone.milestone_status === 'Complete' || this.props.milestone.milestone_status === 'Abandoned' || this.props.milestone.milestone_status === 'Dormant' || this.props.milestone.milestone_status === 'Reviewing' || this.props.milestone.milestone_status === 'Payment Sent' || this.props.milestone.milestone_status === 'Unpaid' ? false : true
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.confirm.data && this.props.confirm.data.id === this.props.milestone.milestone_id) {
            if (this.props.confirm.data.action === 'start milestone' && this.props.confirm.option) {
                this.props.startMilestone(this.props.confirm.data.token, this.props.confirm.data.saveAddress);
                this.setState({startMilestone: false});
                this.props.dispatch(ResetConfirmation());
            } else if (this.props.confirm.data.action === 'pay user' && this.props.confirm.option) {
                this.props.pay();
                this.props.dispatch(ResetConfirmation());
            }
        }
    }

    downloadFile(file) {
        this.setState({status: 'Downloading'});

        fetch.post('/api/job/download', {file: file, user: this.props.user.user.username, milestone_id: this.props.milestone.milestone_id})
        .then(resp => {
            download(resp.data, file);
            this.setState({status: ''});
        })
        .catch(err => {
            LogError(err, '/api/job/download');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    handleToggleMilestoneDetails() {
        this.setState({showMilestoneDetails: !this.state.showMilestoneDetails});
    }
    
    render() {
        console.log(this.props.milestone);
        let status, fundStatus;
        let complete = [];

        if (this.props.milestone.milestone_status === 'In Progress') {
            status = <span className='mini-badge mini-badge-warning mb-1'>In Progress</span>;
        } else if (this.props.milestone.milestone_status === 'Complete' || this.props.milestone.milestone_status === 'Unpaid') {
            status = <span className='mini-badge mini-badge-success mb-1'>Complete</span>;
        } else if (this.props.milestone.milestone_status === 'Requesting Payment') {
            status = <span className='mini-badge mini-badge-info mb-1'>Requesting Payment</span>;
        } else if (this.props.milestone.milestone_status === 'Payment Sent') {
            status = <span className='mini-badge mini-badge-success mb-1'>Payment Sent</span>;
        } else if (this.props.milestone.milestone_status === 'Dormant') {
            status = <span className='mini-badge mini-badge-secondary mb-1'>In Queue</span>;
        } else if (this.props.milestone.milestone_status === 'Pending') {
            status = <span className='mini-badge mini-badge-success mb-1'>Ready</span>;
        }  else if (this.props.milestone.milestone_status === 'Reviewing') {
            status = <span className='mini-badge mini-badge-info mb-1'>Reviewing</span>;
        }
        
        if (this.props.milestone.balance.status === 'available') {
            fundStatus = <span className='mini-badge mini-badge-primary ml-1'>Available</span>;
        } else if (this.props.milestone.balance.status === 'pending') {
            fundStatus = <span className='mini-badge mini-badge-warning ml-1'>Pending</span>;
        }

        let details;

        if (this.state.status === 'Getting Milestone Details') {
            details = <FontAwesomeIcon icon={faCircleNotch} size='lg' spin />;    
        } else if ((this.props.milestone.milestone_status !== 'Pending') || (this.props.milestone.milestone_status === 'In Progress' || this.props.milestone.milestone_status === 'Requesting Payment')) {
            details = <div className='milestone-progress-details'>
                {this.props.milestone.milestone_status === 'In Progress' || this.props.milestone.milestone_status === 'Requesting Payment' ? <div className='mr-2'>
                    <strong>Payment:</strong> <span>{this.props.milestone.balance ? <span>$<MoneyFormatter value={this.props.milestone.milestone_payment_amount} /> {this.props.milestone.balance.currency.toUpperCase()}</span> : ''}</span>
                    {fundStatus}
                </div> : ''}

                {this.props.milestone.milestone_status === 'In Progress' || this.props.milestone.milestone_status === 'Requesting Payment' ? <div className='mr-2'><strong>Funds On-hold:</strong> <span>{moment(this.props.milestone.milestone_fund_due_date).diff(moment(), 'days') + ' days left'}</span></div> : ''}

                {this.props.milestone.milestone_due_date ? <div className='mr-2'><strong>Expected Due:</strong> {moment(this.props.milestone.milestone_due_date).format('MM-DD-YYYY')}</div> : ''}

                {this.props.milestone.milestone_status === 'Complete' || this.props.milestone.milestone_status === 'Unpaid' || this.props.milestone.milestone_status === 'Payment Sent' ? <React.Fragment>
                    <div className='mr-2'><strong>Paid:</strong> $<MoneyFormatter value={this.props.milestone.milestone_payment_amount} /> {this.props.job.job_price_currency.toUpperCase()}</div>
                    <div><strong>Paid on:</strong> {moment(this.props.milestone.balance.created * 1000).format('MM-DD-YYYY')}</div>
                </React.Fragment>: ''}

                {this.props.milestone.milestone_status === 'Requesting Payment' ? <div className='detail-child'><strong>Requested Payment:</strong> $<MoneyFormatter value={parseFloat(this.props.milestone.requested_payment_amount) + parseFloat(this.props.milestone.user_app_fee)} /> {this.props.milestone.balance.currency.toUpperCase()}</div> : ''}
            </div>;
        } else if (this.props.milestone.milestone_status === 'Pending') {
            details = <div className='milestone-progress-details'>
                <div className='mr-2'>
                    <strong>Payment:</strong> <span>{this.props.milestone.milestone_payment_amount ? <span>$<MoneyFormatter value={this.props.milestone.milestone_payment_amount} /> {this.props.job.job_price_currency.toUpperCase()}</span> : ''}</span>
                </div>
            </div>;
        }

        return (
            <React.Fragment>
                <div className={`milestone-tracking-row ${this.props.milestone.milestone_status === 'Dormant' || this.props.milestone.milestone_status === 'Complete' || this.props.milestone.milestone_status === 'Payment Sent' || this.props.milestone.milestone_status === 'Unpaid' || this.props.milestone.milestone_status === 'Reviewing' ? 'disabled' : ''}`}>
                    <div className='milestone-number opaque'><h3>{this.props.index}</h3></div>
    
                    <div className='milestone-progress-container'>
                        <div className='milestone-details-row opaque'>
                            <span>{status}</span>
                        </div>

                        <div className='milestone-progress-bar-track opaque'>
                            <div className={`milestone-progress-bar w-${this.props.milestone.conditions && Math.round(this.props.milestone.conditions.filter(condition => condition.condition_status === 'Complete').length / this.props.milestone.conditions.length * 100)}`}></div>
                        </div>
    
                        <div className='text-center opaque'>{this.props.milestone.conditions && Math.round(this.props.milestone.conditions.filter(condition => condition.condition_status === 'Complete').length / this.props.milestone.conditions.length * 100) || 0}%</div>

                        <div className={`milestone-details-row mb-3 ${this.props.milestone.milestone_status === 'Pending' || this.props.milestone.milestone_status === 'Complete' || this.props.milestone.milestone_status === 'Dormant' ? 'disabled' : ''}`}>
                            <div></div>
                            <div>
                                {complete.indexOf('In Progress') < 0 && this.props.milestone.balance && this.props.milestone.balance.status === 'available' && this.props.milestone.milestone_status === 'Requesting Payment' ? 
                                <SubmitButton type='button' loading={this.state.status === 'Paying'} value='Pay' onClick={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to release your funds?`, <span>An amount of $<MoneyFormatter value={parseFloat(this.props.milestone.requested_payment_amount) + parseFloat(this.props.milestone.user_app_fee)} /> {this.props.milestone.balance.currency.toUpperCase()} will be sent to {this.props.job.job_user}</span>, {action: 'pay user', id: this.props.milestone.milestone_id}))} bgColor='success' /> : ''}
                                {this.props.milestone.milestone_status === 'Pending' ? <button className='btn btn-primary' type='button' onClick={() => this.setState({startMilestone: true})}>Start Milestone</button> : ''}
                                <button className='btn btn-info' onClick={this.handleToggleMilestoneDetails.bind(this)}><FontAwesomeIcon icon={this.state.showMilestoneDetails ? faCaretUp : faCaretDown} /></button>
                            </div>
                        </div>

                        {this.state.showMilestoneDetails ? <>
                            <div className='d-flex-center opaque'>
                                {details}
                            </div>

                            <div className='simple-container no-bg opaque'>
                                <div className='simple-container-title'>Conditions</div>
        
                                {this.props.milestone.conditions && this.props.milestone.conditions.map((condition, i) => {
                                    complete.push(condition.condition_status);
                                    let icon;

                                    if (condition.condition_status === 'Complete') {
                                        icon = <FontAwesomeIcon icon={faCheckSquare} className='text-success mr-1' />;
                                    } else if (condition.condition_status === 'In Progress' || condition.condition_status === 'Pending') {
                                        icon = <FontAwesomeIcon icon={faSquare} className='text-secondary mr-1' />;
                                    } else if (condition.condition_status === 'Deleting') {
                                        icon = <FontAwesomeIcon icon={faTimesSquare} className='text-danger mr-1' />;
                                    }

                                    return <div key={condition.condition_id} className='milestone-tracker-condition-row'>
                                        {icon}
                                        {condition.condition_is_new ? <span className='mini-badge mini-badge-primary mr-1'>New</span> : '' } 
                                        <div className='milestone-tracker-condition-text'>{condition.condition}</div>
                                        {condition.condition_status === 'Deleting' ? <div className='ml-2'><small className='mr-2'>Delete?</small> <small className='condition-link text-success mr-2' onClick={() => this.props.approveCondition(condition.condition_id, 'approve', i)}>Approve</small><small className='condition-link text-danger' onClick={() => this.props.approveCondition(condition.condition_id, 'decline', i)}>Decline</small></div> : ''}
                                    </div>
                                })}
                            </div>

                            {this.props.milestone.files.length > 0 ? <div className='simple-container no-bg'>
                                <div className='simple-container-title'>Files</div>

                                <div className={`milestone-file-list`}>
                                    {this.props.milestone.files.map((file, i) => {
                                        let urlSafeHash = encodeURIComponent(file.file_hash);
                                        let urlSafeFilename = encodeURIComponent(file.filename);

                                        return <div key={file.file_id} className='mb-1'>
                                            <div className={`d-flex-between-center ${this.props.milestone.milestone_status === 'Pending' || this.props.milestone.milestone_status === 'Complete' ? 'disabled' : ''}`}>
                                                <div className='opaque'>
                                                    <div className='d-flex-center'>
                                                        <div className='milestone-filename' title={file.filename}>{file.filename}</div>
                                                    </div>
                
                                                    <small className='mr-2'><strong>Filesize:</strong> {file.filesize / 1000 < 1000 ? `${file.filesize / 1000} KB` : ''} {file.filesize / 1000 > 1000 && file.filesize / 1000000 < 1000 ? `${Math.round(file.filesize / 100000) / 10} MB` : ''} {file.filesize / 1000000 > 1000 ? `${Math.round(file.filesize / 100000000) / 10} GB` : ''}</small>
                                                    <small className='mr-2'><strong>Uploaded:</strong> {moment(file.file_uploaded_date).format('MM-DD-YYYY')}</small>
                                                    <small className='text-dark'>Hash: {file.file_hash}</small>
                                                </div>
                
                                                <a href={`/files/${this.props.user.user.username}/${this.props.milestone.milestone_id}/${urlSafeHash}/${urlSafeFilename}`} target='_blank'>Download</a>
                                            </div>
                
                                            <div className='text-right'>
                                                <small className='text-dark'>File ID: {file.file_id}</small>
                                            </div>
                
                                            {i + 1 !== this.props.milestone.files.length ? <hr/> : ''}
                                        </div>;
                                    })}
                                </div>
                            </div> : ''}
                        </> : ''}

                        {this.state.startMilestone && this.props.milestone.milestone_status === 'Pending' ? <StripeProvider apiKey={process.env.REACT_ENV === 'production' ? 'pk_live_wJ7nxOazDSHu9czRrGjUqpep' : 'pk_test_KgwS8DEnH46HAFvrCaoXPY6R'}>
                            <Elements>
                                <VerifyPayment
                                user={this.props.user}
                                cancel={() => this.setState({startMilestone: false})}
                                submit={(token, save) => this.props.dispatch(ShowConfirmation(`Are you sure you're ready to start this milestone?`, <span>An amount of $<MoneyFormatter value={(this.props.milestone.milestone_payment_amount * 1.03 * 100) / 100} /> ($<MoneyFormatter value={this.props.milestone.milestone_payment_amount} /> + 3%) {this.props.job.job_price_currency} will be charged on the selected payment method</span>, {action: 'start milestone', token: token, id: this.props.milestone.milestone_id, saveAddress: save}))}
                                status={this.state.status} />
                            </Elements>
                        </StripeProvider> : ''}
                    </div>
                </div>

                {this.props.milestone.milestone_status === 'Reviewing' ? <div className='text-right'>
                    <button className='btn btn-primary' type='button'>Approve</button>
                    <button className='btn btn-danger' type='button'>Decline</button>
                </div> : ''}

                <div className='text-right'><small className='text-dark'>Milestone ID: {this.props.milestone.milestone_id}</small></div>
                <hr/>
            </React.Fragment>
        );
    }
}

MilestoneTrackingRow.propTypes = {

};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation,
        prompt: state.Prompt
    }
}

export default connect(mapStateToProps)(MilestoneTrackingRow);