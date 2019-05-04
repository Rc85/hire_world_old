import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faTimes, faCircleNotch, faCaretDown, faCaretUp } from '@fortawesome/pro-solid-svg-icons';
import { faSquare } from '@fortawesome/pro-regular-svg-icons';
import moment from 'moment';
import fetch from 'axios';
import { connect } from 'react-redux';
import { Alert } from '../../../actions/AlertActions';
import { LogError } from '../../utils/LogError';
import SubmitButton from '../../utils/SubmitButton';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';
import Tooltip from '../../utils/Tooltip';
import { PromptOpen, PromptReset } from '../../../actions/PromptActions';
import MoneyFormatter from '../../utils/MoneyFormatter';

let CancelToken = fetch.CancelToken;
let cancelUpload;

class MilestoneUpdaterRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            showDetails: this.props.milestone.milestone_status === 'In Progress' || this.props.milestone.milestone_status === 'Requesting Payment' ? true : false,
            complete: this.props.milestone.conditions.filter(condition => condition.condition_status === 'In Progress'),
            milestone: this.props.milestone,
            file: null,
            uploaded: null
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.confirm.data) {
            if (this.props.confirm.data.action === 'overwrite file' && this.props.confirm.data.id === this.state.milestone.milestone_id) {
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
            if (this.props.prompt.data.action === 'request payment' && this.props.prompt.data.id === this.state.milestone.milestone_id && this.props.prompt.input !== prevProps.prompt.input) {
                this.requestPayment(this.props.prompt.input);
                this.props.dispatch(PromptReset());
            }
        }
    }
    
    updateCondition(id, index, action) {
        if (this.state.milestone.milestone_status !== 'Complete') {
            this.setState({status: `Completing Condition ${id}`});

            fetch.post('/api/job/condition/update', {job_id: this.props.job.job_id, milestone_id: this.state.milestone.milestone_id, condition_id: id, action: action})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let milestone = {...this.state.milestone};
                    milestone.conditions[index] = resp.data.condition;

                    if (action === 'uncheck') {
                        milestone.milestone_status = 'In Progress';
                    }

                    let complete = milestone.conditions.filter(condition => condition.condition_status === 'In Progress');

                    if (this.props.job.job_status === 'Requesting Payment') {
                        this.props.changeJobStatus('Active');
                    }

                    this.setState({status: '', milestone: milestone, complete: complete});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                }

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            })
            .catch(err => {
                LogError(err, '/api/job/condition/update');
                this.setState({status: ''});
                this.props.dispatch(Alert('error', 'An error occurred'));
            });
        } else {
            return;
        }
    }

    requestPayment(value) {
        this.setState({status: 'Requesting Payment'});

        fetch.post('/api/job/payment/request', {milestone_id: this.state.milestone.milestone_id, amount: value})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.changeJobStatus('Requesting Payment');
                this.setState({status: '', milestone: resp.data.milestone});
            } else {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/job/payment/request');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    checkFileExist() {
        this.setState({status: 'Uploading File'});

        let fileTypeChunks = this.state.file.name.split('.');
        let fileType = fileTypeChunks[fileTypeChunks.length - 1];

        fetch.post('/api/job/check-file-exists',
        {milestone_id: this.state.milestone.milestone_id, job_id: this.props.job.job_id, file: this.state.file.name}, 
        {
            headers: {
                filesize: this.state.file.size,
                fileType: fileType
            }
        })
        .then(resp => {
            if (resp.data.status == 'exists') {
                this.props.dispatch(ShowConfirmation(`The file already exists. Do you want to overwrite it?`, false, {action: 'overwrite file', id: this.state.milestone.milestone_id}));
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
            fetch.post('/api/job/upload', {overwrite: 'no', job_id: this.props.job.job_id, milestone_id: this.state.milestone.milestone_id, user: this.props.user.user.username, filename: this.state.file.name})
            .then(resp => {
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
            data.set('milestone_id', this.state.milestone.milestone_id);
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
                    let milestone = {...this.state.milestone};

                    if (!overwrite) {
                        this.state.milestone.files.push(resp.data.file);
                        milestone.have_files = true;
                    } else if (overwrite === 'yes') {
                        for (let i in milestone.files) {
                            if (milestone.files[i].filename === resp.data.file.filename) {
                                milestone.files[i] = resp.data.file;
                            }
                        }
                    }

                    this.setState({status: '', milestone: milestone, file: null, uploaded: null});
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
            });
        }
    }

    cancelUpload() {
        this.setState({status: '', uploaded: null, file: null});
        cancelUpload();
    }

    openFileBrowser() {
        if (this.state.milestone.milestone_status === 'Pending' || this.state.milestone.milestone_status === 'Complete' || this.state.milestone.milestone_status === 'Abandoned') {
            return false;
        } else {
            this.fileUploader.click();
        }
    }

    setFile(file) {
        if (file.size > 250000000) {
            this.props.dispatch(Alert('error', 'File size limit exceeeded'));
        } else {
            this.setState({file: file});
        }
    }

    toggleDetails() {
        if (!this.state.showDetails) {
            if (this.state.milestone.milestone_status === 'In Progress') {
                this.setState({showDetails: !this.state.showDetails});
            } else if (this.state.milestone.milestone_status === 'Pending') {
                return false;
            } else if (this.state.milestone.milestone_status === 'Complete' && !this.state.milestone.balance) {
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
        console.log(this.state)
        let fundStatus, details;

        if (this.state.milestone.balance && this.state.showDetails) {
            if (this.state.milestone.balance.status === 'pending') {
                fundStatus = <span className='mini-badge mini-badge-warning'>Pending</span>;
            } else if (this.state.milestone.balance.status === 'available') {
                fundStatus = <span className='mini-badge mini-badge-primary'>Available</span>;
            } else if (this.state.milestone.balance.status === 'paid') {
                fundStatus = <span className='mini-badge mini-badge-success'>Paid</span>;
            }

            details = <div className={`milestone-conditions-container ${this.state.showDetails ? 'show' : ''} opaque`}>
                <div className='milestone-tracking-details'>
                    <div className='detail-child'><strong>Payment: </strong> {this.state.milestone.balance ? <span>$<MoneyFormatter value={this.state.milestone.balance.net / 100} /> {this.state.milestone.balance.currency.toUpperCase()}</span> : ''} {fundStatus}</div>

                    {!isNaN(moment(this.state.milestone.milestone_fund_due_date).diff(moment(), 'days')) && this.state.milestone.milestone_status !== 'Complete' ? <div className='detail-child'><strong>Days Remaining: </strong> {moment(this.state.milestone.milestone_fund_due_date).diff(moment(), 'days')}</div> : ''}

                    {this.state.milestone.milestone_status === 'Complete' ? <div className='detail-child'><strong>Paid on:</strong> {moment(this.state.milestone.balance.created * 1000).format('MM-DD-YYYY')}</div>: ''}

                    {this.state.milestone.milestone_status === 'Requesting Payment'
                        ? <div className='detail-child'>
                            <strong>Requested Amount:</strong> {this.state.milestone.requested_payment_amount 
                                ? this.state.milestone.requested_payment_amount === this.state.milestone.milestone_payment_after_fees 
                                    ? <span>$<MoneyFormatter value={parseFloat(this.state.milestone.requested_payment_amount)} /> {this.state.milestone.balance.currency.toUpperCase()}</span>
                                    : <span>$<MoneyFormatter value={parseFloat(this.state.milestone.requested_payment_amount) + parseFloat(this.state.milestone.user_app_fee)} /> {this.state.milestone.balance.currency.toUpperCase()}</span>
                                : <span>$<MoneyFormatter value={this.state.milestone.balance.net / 100} /> {this.state.milestone.balance.currency.toUpperCase()}</span>}
                        </div>
                        : ''}
                </div>

                <div className='simple-container no-bg'>
                    <div className='simple-container-title'>Conditions</div>

                    {this.state.milestone.conditions.map((condition, i) => {
                        let icon;

                        if (this.state.status === `Completing Condition ${condition.condition_id}`) {
                            icon = <FontAwesomeIcon icon={faCircleNotch} spin />;
                        } else if (condition.condition_status === 'Complete') {
                            icon = <FontAwesomeIcon icon={faCheckSquare} className='text-success mr-1' />;
                        } else if (condition.condition_status === 'In Progress') {
                            icon = <FontAwesomeIcon icon={faSquare} className='text-grey mr-1' />;
                        } else if (condition.condition_status === 'Complete' && this.state.milestone.milestone_status === 'Complete') {
                            icon = <FontAwesomeIcon icon={faCheckSquare} className='text-success mr-1' />;
                        }

                        return <div key={condition.condition_id} className='condition-row' onClick={() => this.updateCondition(condition.condition_id, i, condition.condition_status === 'In Progress' ? 'check' : 'uncheck')}>
                            {icon} <span>{condition.condition}</span>
                        </div>
                    })}
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

                {this.state.milestone.files.length > 0 ? <div className='simple-container no-bg'>
                    <div className='simple-container-title'>Files</div>

                    {this.state.milestone.files.map((file) => {
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

                <div className='text-right'><small className='text-dark mr-1'>Milestone ID: {this.state.milestone.milestone_id}</small></div>
            </div>;
        } else if (this.state.status === 'Getting Milestone Details' && this.state.showDetails) {
            details = <div className='text-center'><FontAwesomeIcon icon={faCircleNotch} size='5x' spin /></div>;
        }

        let milestoneStatus;

        if (this.state.milestone.milestone_status === 'Complete') {
            milestoneStatus = <span className='mini-badge mini-badge-success'>Complete</span>;
        } else if (this.state.milestone.milestone_status === 'In Progress') {
            milestoneStatus = <span className='mini-badge mini-badge-warning'>In Progress</span>;
        }

        return (
            <div className={`milestone-updater-row ${this.state.milestone.milestone_status === 'Pending' || this.state.milestone.milestone_status === 'Complete' ? 'disabled' : ''}`}>
                <div className='d-flex-between-start'>
                    <div className='milestone-number'><h3>{this.props.index}</h3></div>
    
                    <div className='milestone-progress-container'>
                        <div className='milestone-progress-bar-track opaque'>
                            <div className={`milestone-progress-bar w-${Math.round(this.state.milestone.conditions.filter(condition => condition.condition_status === 'Complete').length / this.state.milestone.conditions.length * 100)}`}></div>
                        </div>
    
                        <div className='milestone-progress-details mb-3'>
                            <div className='milestone-updater-details opaque'>
                                {milestoneStatus}
                            </div>

                            <div className='milestone-updater-details text-center opaque'>
                                <span>{Math.round(this.state.milestone.conditions.filter(condition => condition.condition_status === 'Complete').length / this.state.milestone.conditions.length * 100)}%</span>
                            </div>
    
                            <div className='milestone-updater-details d-flex-end-center'>
                                {this.state.complete.length === 0 && this.state.milestone.milestone_status === 'In Progress' ? <SubmitButton type='button' loading={this.state.status === 'Requesting Payment'} value='Request Payment' bgColor='success' onClick={() => this.props.dispatch(PromptOpen(<span>Enter an amount (up to $<MoneyFormatter value={this.state.milestone.balance.net / 100} />)</span>, this.state.milestone.balance.net / 100, {action: 'request payment', id: this.state.milestone.milestone_id}))} className='mr-1' /> : ''}
                                {this.state.milestone.milestone_status === 'Requesting Payment' ? <button className='btn btn-success' disabled>Payment Requested</button> : ''}

                                <div className='mr-1'><Tooltip text={<React.Fragment>
                                    <li className='ml-2'>.zip, .rar, .tar.gz, .gz, .tgz</li>
                                    <li className='ml-2'>Max 250 GB</li>
                                </React.Fragment>} placement='bottom-right' disabled={this.state.milestone.milestone_status === 'Pending' || this.state.milestone.milestone_status === 'Complete' || this.state.milestone.milestone_status === 'Abandoned'}><SubmitButton type='button' loading={this.state.status === 'Uploading File'} value='Upload File' className='opaque' onClick={() => this.openFileBrowser()} disabled={this.state.milestone.milestone_status === 'Pending' || this.state.milestone.milestone_status === 'Complete' || this.state.milestone.milestone_status === 'Abandoned'} /></Tooltip></div>

                                <button className='btn btn-info' onClick={this.toggleDetails.bind(this)}><FontAwesomeIcon icon={this.state.showDetails ? faCaretUp : faCaretDown} /></button>
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