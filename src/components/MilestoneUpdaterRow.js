import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faTimes, faCircleNotch, faCaretDown, faCaretUp, faPlusSquare, faBan, faTimesCircle, faEllipsisH } from '@fortawesome/pro-solid-svg-icons';
import { faSquare } from '@fortawesome/pro-regular-svg-icons';
import moment from 'moment';
import fetch from 'axios';
import { connect } from 'react-redux';
import { Alert } from '../actions/AlertActions';
import { LogError } from './utils/LogError';
import SubmitButton from './utils/SubmitButton';
import { ShowConfirmation, ResetConfirmation } from '../actions/ConfirmationActions';
import Tooltip from './utils/Tooltip';
import { PromptOpen, PromptReset } from '../actions/PromptActions';
import MoneyFormatter from './utils/MoneyFormatter';
import StaticAlert from './utils/StaticAlert';
import { ShowLoading, HideLoading } from '../actions/LoadingActions';

let CancelToken = fetch.CancelToken;
let cancelUpload;

class MilestoneUpdaterRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            showDetails: this.props.milestone.milestone_status === 'In Progress' || this.props.milestone.milestone_status === 'Requesting Payment' || this.props.milestone.milestone_status === 'Unpaid',
            file: null,
            uploaded: null
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.confirm.data) {
            if (this.props.confirm.data.action === 'overwrite file' && this.props.confirm.data.id === this.props.milestone.milestone_id) {
                if (prevProps.confirm.option !== this.props.confirm.option && this.props.confirm.option) {
                    this.uploadFile('yes');
                    this.props.dispatch(ResetConfirmation());
                } else if (prevProps.confirm.option !== this.props.confirm.option && this.props.confirm.option === false) {
                    this.uploadFile('no');
                    this.props.dispatch(ResetConfirmation());
                }
            }
        }

        if (this.props.prompt.data) {
            if (this.props.prompt.data.action === 'request payment' && this.props.prompt.data.id === this.props.milestone.milestone_id && this.props.prompt.input !== prevProps.prompt.input) {
                this.props.requestPayment(this.props.prompt.input, this.props.milestone.milestone_id);
                this.props.dispatch(PromptReset());
            }
        }
    }

    checkFileExist() {
        this.setState({status: 'Uploading File'});

        let fileTypeChunks = this.state.file.name.split('.');
        let fileType = fileTypeChunks[fileTypeChunks.length - 1];

        fetch.post('/api/job/check-file-exists',
        {milestone_id: this.props.milestone.milestone_id, job_id: this.props.job.job_id, file: this.state.file.name}, 
        {
            headers: {
                filesize: this.state.file.size,
                fileType: fileType
            }
        })
        .then(resp => {
            if (resp.data.status == 'exists') {
                this.props.dispatch(ShowConfirmation(`The file already exists. Do you want to overwrite it?`, false, {action: 'overwrite file', id: this.props.milestone.milestone_id}));
            } else if (resp.data.status === 'not exist') {
                this.uploadFile();
            } else if (resp.data.status === 'error') {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                this.setState({status: '', file: null});
            }
        })
        .catch(err => {
            LogError(err, '/api/job/check-file-exists');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    uploadFile(overwrite) {
        if (overwrite === 'no') {
            fetch.post('/api/job/upload', {overwrite: 'no', job_id: this.props.job.job_id, milestone_id: this.props.milestone.milestone_id, user: this.props.user.user.username, filename: this.state.file.name})
            .then(() => {
                this.setState({status: '', file: null, uploaded: null});
            })
            .catch(err => {
                LogError(err, '/api/job/upload');
                this.setState({status: ''});
                this.props.dispatch(Alert('error', 'An error occurred'));
            });
        } else if (!overwrite || overwrite === 'yes') {
            let data = new FormData();
            data.set('file', this.state.file);
            data.set('job_id', this.props.job.job_id);
            data.set('milestone_id', this.props.milestone.milestone_id);
            data.set('user', this.props.user.user.username);
            
            this.setState({status: 'Uploading File'});

            const config = {
                onUploadProgress: progressEvent => this.setState({uploaded: Math.round(progressEvent.loaded / this.state.file.size * 100)}),
                headers: {
                    'content-type': 'multipart/form-data'
                },
                cancelToken: new CancelToken(token => {
                    cancelUpload = token;
                })
            };

            fetch.post('/api/job/upload', data, config)
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.props.addFile(overwrite, resp.data.file);

                    this.setState({status: '', file: null, uploaded: null});
                } else if (resp.data.status === 'error') {
                    this.setState({status: '', uploaded: null, file: null});
                }

                this.fileUploader.value = '';

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            })
            .catch(err => {
                if (err.message) {
                    LogError(err, '/api/job/upload');
                    this.setState({status: '', uploaded: null, file: null});
                    this.props.dispatch(Alert('error', 'An error occurred'));
                }

                if (fetch.isCancel(err)) {
                    this.setState({status: '', uploaded: null, file: null});
                }

                this.fileUploader.value = '';
            });
        }
    }

    cancelUpload() {
        this.setState({status: '', uploaded: null, file: null});
        cancelUpload();
    }

    openFileBrowser() {
        if (this.props.milestone.milestone_status === 'Pending' || this.props.milestone.milestone_status === 'Complete' || this.props.milestone.milestone_status === 'Incomplete' || this.props.milestone.milestone_status === 'Unpaid') {
            return false;
        } else {
            this.fileUploader.click();
        }
    }

    setFile(file) {
        if (file.size > 1000000000) {
            this.props.dispatch(Alert('error', 'File size limit exceeeded'));
            this.fileUploader.value = '';
            this.setState({file: null});
        } else {
            this.setState({file: file});
        }
    }

    handleConditionText(e) {
        this.setState({newCondition: e.target.value});
    }

    handleAddCondition() {
        this.setState({addCondition: true});
    }

    handleCancelAddCondition() {
        this.setState({addCondition: false});
    }

    addCondition(e) {
        e.preventDefault();
        this.props.addCondition(this.state.newCondition)
        this.setState({addCondition: false});
    }

    handleCancelDeleteRequest(id, index) {
        this.props.cancelDeleteRequest(id, index);
    }

    updateCondition(id, i, action) {
        this.props.updateCondition(id, i, action)
    }

    handlePayout() {
        this.props.payout();
    }

    handleReady() {
        this.props.ready();
    }

    handleDeleteCondition(id, index) {
        this.props.requestDeleteCondition(id, index);
    }
        
    render() {
        let fundStatus, details, payoutStatus

        if (this.props.milestone.balance && this.state.showDetails) {
            if (this.props.milestone.balance.status === 'pending') {
                fundStatus = <span className='mini-badge mini-badge-warning'>Pending</span>;
            } else if (this.props.milestone.balance.status === 'available') {
                fundStatus = <span className='mini-badge mini-badge-primary'>Available</span>;
            }

            if (this.props.milestone.payout.status === 'pending') {
                payoutStatus = <span className='mini-badge mini-badge-warning'>Pending</span>;
            }else if (this.props.milestone.payout.status === 'paid') {
                payoutStatus = <span className='mini-badge mini-badge-success'>Paid</span>;
            } else if (this.props.milestone.payout.status === 'failed') {
                payoutStatus = <span className='mini-badge mini-badge-danger'>Failed</span>;
            } else if (this.props.milestone.payout.status === 'in transit') {
                payoutStatus = <span className='mini-badge mini-badge-info'>Payment Sent</span>;
            }

            details = <div className={`milestone-conditions-container ${this.state.showDetails ? 'show' : ''} opaque`}>
                <div className='milestone-tracking-details'>
                    {this.props.milestone.milestone_status === 'In Progress' || this.props.milestone.milestone_status === 'Requesting Payment' ? <div className='detail-child'><strong>Balance: </strong> {this.props.milestone.balance ? <span>$<MoneyFormatter value={this.props.milestone.balance.net / 100} /> {this.props.milestone.balance.currency.toUpperCase()}</span> : ''} {fundStatus}</div> : ''}

                    {this.props.milestone.milestone_due_date ? <div className='detail-child'><strong>Expected Due:</strong> {moment(this.props.milestone.milestone_due_date).format('MM-DD-YYYY')}</div> : ''}

                    {!isNaN(moment(this.props.milestone.milestone_fund_due_date).diff(moment(), 'days')) && this.props.milestone.milestone_status !== 'Complete' && this.props.milestone.milestone_status !== 'Unpaid' && this.props.milestone.milestone_status === 'Incomplete' && this.props.milestone.milestone_status !== 'Payment Sent' ? <div className='detail-child'><strong>Days Remaining: </strong> {moment(this.props.milestone.milestone_fund_due_date).diff(moment(), 'days')}</div> : ''}

                    {this.props.milestone.balance.status === 'pending' ? <div className='detail-child'><strong>Available on:</strong> {moment(this.props.milestone.balance.available_on * 1000).format('MM-DD-YYYY')}</div> : ''}

                    {this.props.milestone.milestone_status === 'Complete' || this.props.milestone.milestone_status === 'Payment Sent' || this.props.milestone.milestone_status === 'Unpaid' ? <React.Fragment>
                        <div className='detail-child'><strong>Payout Amount:</strong> $<MoneyFormatter value={this.props.milestone.payout.amount / 100} /> {this.props.milestone.payout.currency.toUpperCase()} {payoutStatus}</div>
                        <div className='detail-child'><strong>Payout Date:</strong> {moment(this.props.milestone.balance.created * 1000).format('MM-DD-YYYY')}</div>
                        <div className='detail-child'><strong>Expected Arrival:</strong> {moment(this.props.milestone.payout.arrival_date * 1000).format('MM-DD-YYYY')}</div>
                    </React.Fragment>: ''}

                    {this.props.milestone.milestone_status === 'Requesting Payment' ? <div className='detail-child'><strong>Requested Amount:</strong> <span>$<MoneyFormatter value={parseFloat(this.props.milestone.requested_payment_amount)} /> {this.props.milestone.balance.currency.toUpperCase()}</span></div>
                        : ''}
                </div>

                {this.props.milestone.payout.failure_message ? <StaticAlert text={this.props.milestone.payout.failure_message} status='danger' /> : ''}

                <div className='simple-container no-bg'>
                    <div className='simple-container-title'>Conditions</div>

                    {this.props.milestone.conditions && this.props.milestone.conditions.map((condition, i) => {
                        let icon;

                        if (this.props.status === `Completing Condition ${condition.condition_id}`) {
                            icon = <FontAwesomeIcon icon={faCircleNotch} spin />;
                        } else if (condition.condition_status === 'Complete') {
                            icon = <FontAwesomeIcon icon={faCheckSquare} className='text-success mr-1 condition-row-icon' onClick={this.updateCondition.bind(this, condition.condition_id, i, 'uncheck')} />;
                        } else if (condition.condition_status === 'In Progress') {
                            icon = <FontAwesomeIcon icon={faSquare} className='text-grey mr-1 condition-row-icon' onClick={this.updateCondition.bind(this, condition.condition_id, i, 'check')} />;
                        } else if (condition.condition_status === 'Complete' && this.props.milestone.milestone_status === 'Complete') {
                            icon = <FontAwesomeIcon icon={faCheckSquare} className='text-success mr-1' />;
                        } else if (condition.condition_status === 'Deleting') {
                            icon = <FontAwesomeIcon icon={faBan} className='text-secondary mr-1' />;
                        }

                        return <div key={condition.condition_id} className={`condition-row`}>
                            <div>{icon} <span className='mr-2'>{condition.condition}</span> {this.state.status === `Deleting Condition ${condition.condition_id}` ? <FontAwesomeIcon icon={faCircleNotch} spin /> : condition.condition_status !== 'Deleting' ? <FontAwesomeIcon icon={faTimesCircle} className='text-danger condition-row-icon' onClick={this.handleDeleteCondition.bind(this, condition.condition_id, i)} /> : <><small className='mini-badge mini-badge-info mr-2'>Waiting approval to delete</small><small className='condition-link text-alt-highlight' onClick={this.handleCancelDeleteRequest.bind(this, condition.condition_id, i)}>Cancel</small></>}</div>
                        </div>
                    })}

                    {this.state.status === 'Adding Condition'
                        ? <FontAwesomeIcon icon={faCircleNotch} spin />
                        : <div className='condition-row'>{this.state.addCondition 
                            ? <form className='d-flex w-100' onSubmit={this.addCondition.bind(this)}>
                                <input type='text' onChange={this.handleConditionText.bind(this)} className='mr-1 fg-1' />
                                <button type='submit' className='btn btn-primary'>Add</button>
                                <button type='button' className='btn btn-secondary' onClick={this.handleCancelAddCondition.bind(this)}>Cancel</button>
                            </form>
                            : <FontAwesomeIcon icon={faPlusSquare} className='condition-row-icon text-info' onClick={this.handleAddCondition.bind(this)} />}</div>}
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    this.checkFileExist();
                }} encType='multipart/form-data'>
                    <input type='file' onChange={(e) => this.setFile(e.target.files[0])} className='milestone-upload-file' ref={e => this.fileUploader = e} />

                    {this.state.file ? <div className='simple-container no-bg'>
                        <div className='simple-container-title'>Uploading File</div>

                        {this.state.uploaded ? <div className='d-flex-between-start'>
                            <div className='fg-1 mr-1'>
                                <div className='milestone-upload-progress-track'>
                                    <div className={`milestone-upload-progress-bar ${!this.state.uploaded ? '' : `w-${this.state.uploaded}`}`}></div>
                                </div>

                                <div className='text-center mb-3'>{this.state.uploaded < 100 ? `${this.state.uploaded}%` : 'Copying file...'}</div>
                            </div>

                            <button className='btn btn-secondary' type='button' onClick={() => this.cancelUpload()}>Cancel</button>
                        </div> :

                        <div className='d-flex-between-center'>
                            <div className='d-flex-center w-100'>
                                <div className='milestone-filename' title={this.state.file.name}><strong>Filename:</strong> {this.state.file.name}</div>
                                <div className='mr-2'><strong>Filesize:</strong> {this.state.file.size / 1000 < 1000 ? `${this.state.file.size / 1000} KB` : ''} {this.state.file.size / 1000 > 1000 && this.state.file.size / 1000000 < 1000  ? `${Math.round(this.state.file.size / 100000) / 10} MB` : ''} {this.state.file.size / 1000000 > 1000 ? `${Math.round(this.state.file.size / 100000000) / 10} GB` : ''}</div>
                            </div>

                            <div className='d-flex-center'>
                                <SubmitButton type='submit' loading={this.state.status === 'Uploading File'} value='Upload' />
                                <button className='btn btn-secondary' type='button' onClick={() => this.setState({file: null})}>Cancel</button>
                            </div>
                        </div>}
                    </div> : ''}
                </form>

                {this.props.milestone.files.length > 0 ? <div className='simple-container no-bg'>
                    <div className='simple-container-title'>Files</div>

                    {this.props.milestone.files.map((file) => {
                        return <div key={file.file_id} className='milestone-file-row mb-2'>
                            <div className='milestone-filename' title={file.filename}><strong>Filename:</strong> {file.filename}</div>

                            <div className='milestone-file-details'>
                                <small className='mr-2'><strong>Filesize:</strong> {file.filesize / 1000 < 1000 ? `${file.filesize / 1000} KB` : ''} {file.filesize / 1000 > 1000 && file.filesize / 1000000 < 1000 ? `${Math.round(file.filesize / 100000) / 10} MB` : ''} {file.filesize / 1000000 > 1000 ? `${Math.round(file.filesize / 100000000) / 10} GB` : ''}</small>
                                <small className='mr-2'><strong>Uploaded:</strong> {moment(file.file_uploaded_date).format('MM-DD-YYYY')}</small>
                                <small className='mr-2'><strong>Downloaded:</strong> {file.file_download_counter}</small>
                            </div>
                        </div>;
                    })}
                </div> : ''}

                <div className='text-right'><small className='text-dark mr-1'>Milestone ID: {this.props.milestone.milestone_id}</small></div>
            </div>;
        } else if (this.state.status === 'Getting Milestone Details' && this.state.showDetails) {
            details = <div className='text-center'><FontAwesomeIcon icon={faCircleNotch} size='5x' spin /></div>;
        }

        let milestoneStatus;

        if (this.props.milestone.milestone_status === 'Complete') {
            milestoneStatus = <span className='mini-badge mini-badge-success'>Complete</span>;
        } else if (this.props.milestone.milestone_status === 'In Progress') {
            milestoneStatus = <span className='mini-badge mini-badge-warning'>In Progress</span>;
        } else if (this.props.milestone.milestone_status === 'Payment Sent') {
            milestoneStatus = <span className='mini-badge mini-badge-success'>Payment Sent</span>;
        } else if (this.props.milestone.milestone_status === 'Unpaid') {
            milestoneStatus = <span className='mini-badge mini-badge-danger'>Unpaid</span>;
        } else if (this.props.milestone.milestone_status === 'Incomplete') {
            milestoneStatus = <span className='mini-badge mini-badge-danger'>Incomplete</span>;
        } else if (this.props.milestone.milestone_status === 'Reviewing') {
            milestoneStatus = <span className='mini-badge mini-badge-info'>Reviewing</span>;
        } else if (this.props.milestone.milestone_status === 'Dormant') {
            milestoneStatus = <span className='mini-badge mini-badge-secondary'>In Queue</span>;
        } else if (this.props.milestone.milestone_status === 'Requesting Payment') {
            milestoneStatus = <span className='mini-badge mini-badge-info'>Requesting Payment</span>;
        } else if (this.props.milestone.milestone_status === 'Pending') {
            milestoneStatus = <span className='mini-badge mini-badge-success'>Ready</span>;
        }

        return (
            <div className={`milestone-updater-row ${this.props.milestone.milestone_status === 'Dormant' || this.props.milestone.milestone_status === 'Pending' || this.props.milestone.milestone_status === 'Incomplete' || this.props.milestone.milestone_status === 'Reviewing'  || this.props.milestone.payout.status === 'paid' ? 'disabled' : ''}`}>
                <div className='milestone-updater-row-header'>
                    <div className='milestone-number'><h3>{this.props.index}</h3></div>
    
                    <div className='milestone-progress-container'>
                        <div className='milestone-progress-bar-track opaque'>
                            <div className={`milestone-progress-bar w-${this.props.milestone.conditions && Math.round(this.props.milestone.conditions && this.props.milestone.conditions.filter(condition => condition.condition_status === 'Complete').length / this.props.milestone.conditions.length * 100)}`}></div>
                        </div>
    
                        <div className='milestone-progress-details mb-3'>
                            <div className='milestone-updater-details opaque'>
                                {milestoneStatus}
                            </div>

                            <div className='milestone-updater-details text-center opaque'>
                                <span>{this.props.milestone.conditions && Math.round(this.props.milestone.conditions && this.props.milestone.conditions.filter(condition => condition.condition_status === 'Complete').length / this.props.milestone.conditions.length * 100) || 0}%</span>
                            </div>
    
                            <div className='milestone-updater-details d-flex-end-center'>
                                {this.props.complete && this.props.job.job_status === 'Active' && this.props.milestone.milestone_status === 'In Progress' && this.props.milestone.balance.status === 'available' ? <SubmitButton type='button' loading={this.props.status === 'Requesting Payment'} value='Request Payment' bgColor='success' onClick={() => this.props.dispatch(PromptOpen(<span>Enter an amount (up to $<MoneyFormatter value={this.props.milestone.balance.net / 100} />)</span>, this.props.milestone.balance.net / 100, {action: 'request payment', id: this.props.milestone.milestone_id}))} className='mr-1' /> : ''}
                                {this.props.milestone.payout.status === 'failed' ? <button className='btn btn-success' onClick={this.handlePayout.bind(this)}>Pay Out</button> : ''}

                                <div className='mr-1'><Tooltip text={<React.Fragment>
                                    <li className='ml-2'>.zip, .rar, .tar.gz, .gz, .tgz</li>
                                    <li className='ml-2'>Max 250 GB</li>
                                </React.Fragment>} placement='bottom-right' disabled={this.props.milestone.milestone_status === 'Pending' || this.props.milestone.milestone_status === 'Complete' || this.props.milestone.milestone_status === 'Incomplete'}><SubmitButton type='button' loading={this.state.status === 'Uploading File'} value='Upload File' className='opaque' onClick={() => this.openFileBrowser()} disabled={this.props.milestone.milestone_status === 'Pending' || this.props.milestone.milestone_status === 'Complete' || this.props.milestone.milestone_status === 'Incomplete' || this.props.milestone.milestone_status === 'Unpaid'} /></Tooltip></div>

                                <div>
                                    {this.props.milestone.milestone_status === 'Dormant' ? <button className='btn btn-success' onClick={this.handleReady.bind(this)} disabled={this.state.status === 'Preparing'}>Ready</button> : ''}
                                    <button className='btn btn-info' onClick={() => this.setState({showDetails: !this.state.showDetails})}><FontAwesomeIcon icon={this.state.showDetails ? faCaretUp : faCaretDown} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {details}
            </div>
        );
    }
}

MilestoneUpdaterRow.propTypes = {

};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation,
        prompt: state.Prompt
    }
}

export default connect(mapStateToProps)(MilestoneUpdaterRow);