import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload, faCheckSquare, faMoneyCheckAlt, faCaretDown, faCaretUp, faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
import Tooltip from '../../utils/Tooltip';
import { faSquare } from '@fortawesome/pro-regular-svg-icons';
import moment from 'moment';
import fetch from 'axios';
import { Alert } from '../../../actions/AlertActions';
import { connect } from 'react-redux';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';
import VerifyPayment from './VerifyPayment';
import { StripeProvider, Elements } from 'react-stripe-elements';
import { LogError } from '../../utils/LogError';
import { PromptOpen, PromptReset } from '../../../actions/PromptActions';
import SubmitButton from '../../utils/SubmitButton';
import download from 'js-file-download';
import { ShowLoading, HideLoading } from '../../../actions/LoadingActions';
import MoneyFormatter from '../../utils/MoneyFormatter';

class MilestoneTrackingRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            milestone: this.props.milestone,
            startMilestone: false,
            showFileList: this.props.milestone.milestone_status === 'Complete' || this.props.milestone.milestone_status === 'Abandoned' ? false : true,
            showDetails: this.props.milestone.milestone_status === 'In Progress' ? true : false
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.confirm.data) {
            if (this.props.confirm.data.action === 'start milestone' && this.props.confirm.option && this.props.confirm.data.id === this.state.milestone.milestone_id) {
                this.startMilestone(this.props.confirm.data.token, this.props.confirm.data.saveAddress);
                this.props.dispatch(ResetConfirmation());
            } else if (this.props.confirm.data.action === 'pay user' && this.props.confirm.option && this.props.confirm.data.id === this.state.milestone.milestone_id) {
                this.pay();
                this.props.dispatch(ResetConfirmation());
            }
        }
    }
    
    pay() {
        if (this.state.milestone.milestone_status === 'Requesting Payment') {
            this.setState({status: 'Paying'});
            this.props.dispatch(ShowLoading(`Paying out funds`));

            fetch.post('/api/job/pay', {milestone_id: this.state.milestone.milestone_id, job_modified_date: this.props.job.job_modified_date})
            .then(resp => {
                if (resp.data.status === 'success') {
                    if (resp.data.jobComplete) {
                        this.props.changeJobStatus('Complete', resp.data.review);
                    } else if (this.props.job.job_status === 'Requesting Payment') {
                        this.props.changeJobStatus('Active');
                    }

                    this.setState({status: '', milestone: resp.data.milestone, showFileList: false});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                }

                this.props.dispatch(HideLoading());
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            })
            .catch(err => {
                LogError(err, '/api/job/pay');
                this.setState({status: ''});
                this.props.dispatch(Alert('error', 'An error occurred'));
                this.props.dispatch(HideLoading());
            });
        } else {
            return false;
        }
    }

    startMilestone(token, save) {
        if (this.state.milestone.milestone_status === 'Pending') {
            this.props.dispatch(ShowLoading('Processing'));
            this.setState({status: 'Verifying'});

            fetch.post('/api/job/milestone/start', {job_id: this.props.job.job_id, id: this.state.milestone.milestone_id, user: this.props.user.user.username, ...token, saveAddress: save})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.props.changeJobStatus('Active');
                    this.setState({status: '', milestone: resp.data.milestone, startMilestone: false});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                }
                
                this.props.dispatch(HideLoading());
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            })
            .catch(err => {
                LogError(err, '/api/job/milestone/start');
                this.setState({status: ''});
                this.props.dispatch(HideLoading());
                this.props.dispatch(Alert('error', 'An error occurred'));
            });
        } else {
            this.props.dispatch(Alert('error', 'Cannot start milestone'));
        }
    }

    downloadFile(file) {
        this.setState({status: 'Downloading'});

        fetch.post('/api/job/download', {file: file, user: this.props.user.user.username, milestone_id: this.state.milestone.milestone_id})
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

    toggleDetails() {
        if (!this.state.showDetails) {
            if (this.state.milestone.milestone_status === 'Complete' && !this.state.milestone.balance) {
                this.setState({status: 'Getting Milestone Details', showDetails: true});

                fetch.post('/api/get/milestone/details', {id: this.state.milestone.milestone_id})
                .then(resp => {
                    if (resp.data.status === 'success') {
                        let milestone = {...this.state.milestone};
                        milestone['balance'] = resp.data.balance;
                        milestone['files'] = resp.data.files;
                        this.setState({status: '', milestone: milestone});
                    } else if (resp.data.status === 'error') {
                        this.setState({status: '', showDetails: false});
                        this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                    }
                })
                .catch(err => {
                    LogError(err, '/api/get/milestone/details');
                    this.setState({status: '', showDetails: false});
                    this.props.dispatch(Alert('error', 'An error occurred'));
                });
            } else if (this.state.milestone.milestone_status === 'Complete' && this.state.milestone.balance) {
                this.setState({showDetails: true});
            }
        } else {
            this.setState({showDetails: false});
        }
    }
    
    render() {
        let status, fundStatus;
        let complete = [];

        if (this.state.milestone.milestone_status === 'In Progress') {
            status = <span className='mini-badge mini-badge-warning mb-1'>In Progress</span>;
        } else if (this.state.milestone.milestone_status === 'Complete') {
            status = <span className='mini-badge mini-badge-success mb-1'>Complete</span>;
        } else if (this.state.milestone.milestone_status === 'Requesting Payment') {
            status = <span className='mini-badge mini-badge-info mb-1'>Requesting Payment...</span>;
        }
        
        if (this.state.milestone.balance && this.state.milestone.balance.status === 'available') {
            fundStatus = <span className='mini-badge mini-badge-primary ml-1'>Available</span>;
        } else if (this.state.milestone.balance && this.state.milestone.balance.status === 'pending') {
            fundStatus = <span className='mini-badge mini-badge-warning ml-1'>Pending</span>;
        } else if (this.state.milestone.balance && this.state.milestone.balance.status === 'paid') {
            fundStatus = <span className='mini-badge mini-badge-success ml-1'>Paid</span>;
        }

        let details;

        if (this.state.status === 'Getting Milestone Details') {
            details = <FontAwesomeIcon icon={faCircleNotch} size='lg' spin />;    
        } else if ((this.state.milestone.milestone_status !== 'Pending' && this.state.milestone.balance && this.state.showDetails) || (this.state.milestone.milestone_status === 'In Progress' || this.state.milestone.milestone_status === 'Requesting Payment')) {
            details = <div className='milestone-progress-details'>
                <div className='mr-2'>
                    <strong>Payment:</strong> <span>{this.state.milestone.balance ? <span>$<MoneyFormatter value={this.state.milestone.balance.net / 100} /> {this.state.milestone.balance.currency.toUpperCase()}</span> : ''}</span>
                    {fundStatus}
                </div>

                {this.state.milestone.milestone_status !== 'Complete' ? <div className='mr-2'><strong>Funds On-hold:</strong> <span>{moment(this.state.milestone.milestone_fund_due_date).diff(moment(), 'days') + ' days left'}</span></div> : ''}

                {this.state.milestone.milestone_status === 'Complete' ? <div className='detail-child'><strong>Paid on:</strong> {moment(this.state.milestone.balance.created * 1000).format('MM-DD-YYYY')}</div>: ''}

                {this.state.milestone.milestone_status === 'Requesting Payment' ? <div className='detail-child'><strong>Requested Payment:</strong> $<MoneyFormatter value={this.state.milestone.requested_payment_amount} /> {this.state.milestone.balance.currency.toUpperCase()}</div> : ''}
            </div>;
        } else if (this.state.milestone.milestone_status === 'Pending') {
            details = <div className='milestone-progress-details'>
                <div className='mr-2'>
                    <strong>Payment:</strong> <span>{this.state.milestone.milestone_payment_amount ? <span>$<MoneyFormatter value={this.state.milestone.milestone_payment_amount} /> {this.props.job.job_price_currency.toUpperCase()}</span> : ''}</span>
                </div>
            </div>;
        }

        return (
            <React.Fragment>
                <div className={`milestone-tracking-row ${this.state.milestone.milestone_status === 'Pending' || this.state.milestone.milestone_status === 'Complete' ? 'disabled' : ''}`}>
                    <div className='milestone-number opaque'><h3>{this.props.index}</h3></div>
    
                    <div className='milestone-progress-container'>
                        <div className='d-flex-between-center opaque'>
                            <span>{status}</span>
                            <small className='text-dark'>Milestone ID: {this.state.milestone.milestone_id}</small>
                        </div>
    
                        <Tooltip placement='bottom' tooltipClassName='bg-light' textColor='text-black' disabled={this.state.milestone.milestone_status === 'Pending'} text={<div className='milestone-tracker-conditions'>
                            <strong>Conditions</strong>
    
                            <hr className='mt-1 mb-1'/>
    
                            {this.state.milestone.conditions.map((condition, i) => {
                                complete.push(condition.condition_status);

                                return <div key={condition.condition_id} className='milestone-tracker-condition-row'>
                                    <FontAwesomeIcon icon={condition.condition_status === 'In Progress' ? faSquare : faCheckSquare} className={`${condition.condition_status === 'In Progress' ? 'text-grey' : 'text-success'} mr-1`} />
                                    <div className='milestone-tracker-condition-text'>{condition.condition}</div>
                                </div>
                            })}
                        </div>}><div className='milestone-progress-bar-track opaque'>
                            <div className={`milestone-progress-bar w-${Math.round(this.state.milestone.conditions.filter(condition => condition.condition_status === 'Complete').length / this.state.milestone.conditions.length * 100)}`}></div>
                        </div></Tooltip>
    
                        <div className='text-center opaque'>{Math.round(this.state.milestone.conditions.filter(condition => condition.condition_status === 'Complete').length / this.state.milestone.conditions.length * 100)}%</div>
                    </div>
                </div>

                <div className={`d-flex-between-center ${this.state.milestone.milestone_status === 'Pending' || this.state.milestone.milestone_status === 'Complete' ? 'disabled' : ''}`}>
                    <div className='d-flex-center opaque'>
                        {details}
                    </div>

                    <div>
                        {complete.indexOf('In Progress') < 0 && this.state.milestone.balance && this.state.milestone.balance.status === 'available' && this.state.milestone.milestone_status === 'Requesting Payment' ? 
                        <SubmitButton type='button' loading={this.state.status === 'Paying'} value='Pay' onClick={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to release your funds?`, <span>An amount of $<MoneyFormatter value={this.state.milestone.requested_payment_amount} /> {this.state.milestone.balance.currency.toUpperCase()} will be paid out to {this.props.job.job_user}</span>, {action: 'pay user', id: this.state.milestone.milestone_id}))} bgColor='success' /> : ''}
                        {this.state.milestone.milestone_status === 'Pending' ? <button className='btn btn-primary milestone-button' type='button' onClick={() => this.setState({startMilestone: true})}>Start Milestone</button> : ''}
                        {this.state.milestone.milestone_status === 'Complete' ? <button className='btn btn-info' onClick={this.toggleDetails.bind(this)}><FontAwesomeIcon icon={this.state.showDetails ? faCaretUp : faCaretDown} /></button> : ''}
                    </div>
                </div>

                {this.state.startMilestone && this.state.milestone.milestone_status === 'Pending' ? <StripeProvider apiKey={process.env.REACT_ENV === 'production' ? 'pk_live_wJ7nxOazDSHu9czRrGjUqpep' : 'pk_test_KgwS8DEnH46HAFvrCaoXPY6R'}>
                    <Elements>
                        <VerifyPayment
                        user={this.props.user}
                        cancel={() => this.setState({startMilestone: false})}
                        submit={(token, save) => this.props.dispatch(ShowConfirmation(`Are you sure you're ready to start this milestone?`, <span>An amount of $<MoneyFormatter value={(this.state.milestone.milestone_payment_amount * 1.03 * 100) / 100} /> ($<MoneyFormatter value={this.state.milestone.milestone_payment_amount} /> + 3%) {this.props.job.job_price_currency} will be charged on the selected payment method</span>, {action: 'start milestone', token: token, id: this.state.milestone.milestone_id, saveAddress: save}))}
                        status={this.state.status} />
                    </Elements>
                </StripeProvider> : ''}

                {this.state.milestone.files.length > 0 ? <div className='simple-container no-bg'>
                    <div className='simple-container-title'>Files</div>

                    <div className='text-right mb-3'><button className='btn btn-info' onClick={() => this.setState({showFileList: !this.state.showFileList})}><FontAwesomeIcon icon={this.state.showFileList ? faCaretUp :faCaretDown} /></button></div>

                    <div className={`milestone-file-list ${!this.state.showFileList ? 'hide' : ''}`}>
                        {this.state.milestone.files.map((file, i) => {
                            let urlSafeHash = encodeURIComponent(file.file_hash);
                            let urlSafeFilename = encodeURIComponent(file.filename);

                            return <div key={file.file_id} className='mb-1'>
                                <div className={`d-flex-between-center ${this.state.milestone.milestone_status === 'Pending' || this.state.milestone.milestone_status === 'Complete' ? 'disabled' : ''}`}>
                                    <div className='opaque'>
                                        <div className='d-flex-center'>
                                            <div className='milestone-filename' title={file.filename}>{file.filename}</div>
                                        </div>
    
                                        <small className='mr-2'><strong>Filesize:</strong> {file.filesize / 1000 < 1000 ? `${file.filesize / 1000} KB` : ''} {file.filesize / 1000 > 1000 && file.filesize / 1000000 < 1000 ? `${Math.round(file.filesize / 100000) / 10} MB` : ''} {file.filesize / 1000000 > 1000 ? `${Math.round(file.filesize / 100000000) / 10} GB` : ''}</small>
                                        <small className='mr-2'><strong>Uploaded:</strong> {moment(file.file_uploaded_date).format('MM-DD-YYYY')}</small>
                                        <small className='text-dark'>Hash: {file.file_hash}</small>
                                    </div>
    
                                    <a href={`/files/${this.props.user.user.username}/${this.state.milestone.milestone_id}/${urlSafeHash}/${urlSafeFilename}`} target='_blank'>Download</a>
                                </div>
    
                                <div className='text-right'>
                                    <small className='text-dark'>File ID: {file.file_id}</small>
                                </div>
    
                                {i + 1 !== this.state.milestone.files.length ? <hr/> : ''}
                            </div>;
                        })}
                    </div>
                </div> : ''}

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