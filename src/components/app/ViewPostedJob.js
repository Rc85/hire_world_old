import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faSackDollar, faMapMarkerAlt, faExclamationTriangle, faEye, faBullseye, faInfoSquare, faGlobe, faCalendarTimes, faHeart, faCircleNotch, faUserMinus, faMinusCircle } from '@fortawesome/pro-solid-svg-icons';
import TitledContainer from '../utils/TitledContainer';
import { LogError } from '../utils/LogError';
import Loading from '../utils/Loading';
import { Redirect, withRouter } from 'react-router-dom';
import fetch from 'axios';
import UserProfilePic from '../includes/page/UserProfilePic';
import { faThList, faUser, faBuilding, faCalendar, faCalendarAlt, faUserPlus } from '@fortawesome/pro-solid-svg-icons';
import Username from '../includes/page/Username';
import moment from 'moment';
import { faFacebook, faTwitter, faInstagram, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import TextArea from '../utils/TextArea';
import SubmitButton from '../utils/SubmitButton';
import PostedJobApplicants from '../includes/page/PostedJobApplicants';
import MoneyFormatter from '../utils/MoneyFormatter';
import { Alert } from '../../actions/AlertActions';
import { connect } from 'react-redux';
import { ShowSelectionModal, ResetSelection, ResetSelectionConfirm } from '../../actions/SelectModalActions';
import { HideLoading, ShowLoading } from '../../actions/LoadingActions';
import Tooltip from '../utils/Tooltip';

class ViewPostedJob extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            job: {},
            details: '',
            notification: false,
            application: null,
            isFriend: false,
            saved: false
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.selection.data.action) {
            if (!prevProps.selection.selected && !this.props.selection.selected && this.props.selection.confirm) {
                this.props.dispatch(Alert('error', 'Please select a reason'));
                this.props.dispatch(ResetSelectionConfirm());
            } else if (this.props.selection.confirm !== prevProps.selection.confirm) {
                if (this.props.selection.data.action === 'report' && this.props.selection.selected && this.props.selection.confirm) {
                    this.submitReport(this.props.selection.selected, this.props.selection.specified);
                    this.props.dispatch(ResetSelection());
                }
            }
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/posted/job', {id: this.props.match.params.id, url: this.props.location.pathname})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', job: resp.data.job, application: resp.data.application, isFriend: resp.data.isFriend, saved: resp.data.saved, reported: resp.data.reported});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/posted/job');
            this.setState({status: 'error'});
        })
    }

    apply() {
        this.setState({status: 'Applying'});

        fetch.post('/api/posted/job/apply', {id: this.props.match.params.id, user: this.props.user.user.username, details: this.state.details, notification: this.state.notification})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', application: resp.data.application, details: '', notification: false});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/posted/job/apply');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        })
    }

    toggleNotification(status) {
        this.setState({status: 'Toggling Notification'});

        fetch.post('/api/posted/job/notification', {id: this.state.application.application_id, user: this.props.user.user.username, status: status})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', application: resp.data.application});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/posted/job/notification');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    friendUser(action) {
        this.setState({status: 'Adding'});

        fetch.post('/api/user/friend', {user: this.state.job.job_post_user, action: action})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', isFriend: action === 'add'});
            }  else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/user/friend');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    save(bool) {
        this.setState({status: 'Saving'});

        fetch.post('/api/posted/job/save', {id: this.state.job.job_post_id, action: bool})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', saved: bool});
            }  else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/posted/job/save');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    submitReport(reason, specified) {
        this.props.dispatch(ShowLoading('Sending report'));

        fetch.post('/api/report/submit', {url: this.props.location.pathname, type: 'Job Posting', reason: reason, specified: specified === '' ? null : specified})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({reported: true});
            }

            this.props.dispatch(HideLoading());
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/report/submit');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }
    
    render() {
        if (this.state.status === 'error') {
            return <Redirect to='/error/app/500' />;
        } else if (this.state.status === 'Loading') {
            return <Loading size='7x' color='black' />;
        }

        let payment = <React.Fragment><strong>{this.state.job.job_post_payment_type}:</strong> {this.state.job.job_post_budget_threshold} <span>$<MoneyFormatter value={this.state.job.job_post_budget} /></span></React.Fragment>;

        if (this.state.job.job_post_budget_threshold === 'Exactly') {
            payment = <React.Fragment><strong>{this.state.job.job_post_payment_type}:</strong> <span>$<MoneyFormatter value={this.state.job.job_post_budget} /></span></React.Fragment>;
        } else if (this.state.job.job_post_budget_threshold === 'Between') {
            payment = <React.Fragment><strong>{this.state.job.job_post_payment_type}:</strong> <span>$<MoneyFormatter value={this.state.job.job_post_budget} /> to $<MoneyFormatter value={this.state.job.job_post_budget_end} /></span></React.Fragment>;
        } else if (this.state.job.job_post_budget_threshold === 'To Be Discussed') {
            payment = <strong>{this.state.job.job_post_budget_threshold}</strong>;
        }

        let application;

        if (this.props.user.user && this.props.user.user.username !== this.state.job.job_post_user && !this.state.application) {
            application = <form onSubmit={(e) => {
                e.preventDefault();
                this.apply();
            }}>
                <TextArea onChange={(val) => this.setState({details: val})} textAreaClassName='w-100' label='Apply' placeholder='Anything else you would like the recruiter to know such as an offer, time it will take to complete the job, etc.' className='mb-1' value={this.state.details} />

                <div className='mb-3'><label><input type='checkbox' onChange={() => this.setState({notification: !this.state.notification})} checked={this.state.notification} /> Notify me by email if I am not selected</label></div>

                <div className='text-right'>
                    <SubmitButton type='submit' loading={this.state.status === 'Applying'} />
                    <button className='btn btn-secondary' type='reset'>Clear</button>
                </div>
            </form>;
        } else if (this.props.user.user && this.props.user.user.username !== this.state.job.job_post_user) {
            application = <div className='text-center'><h4>You already applied to this job</h4></div>;
        } else if (this.props.user.user && this.props.user.user.username === this.state.job.job_post_user) {
            application = <PostedJobApplicants id={this.props.match.params.id} user={this.props.user} />;
        }

        return (
            <section id='view-posted-job' className='main-panel'>
                <TitledContainer title='Job Post' bgColor='green' icon={<FontAwesomeIcon icon={faBriefcase} />} className='mb-3' shadow>
                    <div className='view-header mb-3'>
                        <div className='view-profile-pic'>
                            <UserProfilePic url={this.state.job.avatar_url} />
                        </div>
    
                        <div className='view-header-title'>
                            <div className='mb-3'>
                                <h1>{this.state.job.job_post_title}</h1>
                                <div className='view-header-title-details mb-3'>
                                    {this.state.job.job_post_as_user ?
                                    <div className='mr-2'><FontAwesomeIcon icon={faUser} className='text-special mr-1' /> <Username username={this.state.job.job_post_user} color='alt-highlight' /></div> : 
                                    <div className='mr-2'><FontAwesomeIcon icon={faBuilding} className='text-special mr-1' /> {this.state.job.job_post_company_website ? 
                                        <a href={this.state.job.job_post_company_website} rel='noopener noreferrer' target='_blank'>{this.state.job.job_post_company}</a> : 
                                        this.state.job.job_post_company}</div>
                                    }
                                    <div className='mr-2'><FontAwesomeIcon icon={faCalendarAlt} className='text-special mr-1' /> {moment(this.state.job.job_post_date).format('MM-DD-YYYY')} {this.state.job.job_post_modified_date ? <small><em>(Last updated {moment(this.state.job.job_post_modified_date).format('MM-DD-YYYY')})</em></small> : ''}</div>
                                </div>

                                <div className='view-header-title-details'>
                                    <div className='mr-2'>
                                        {this.state.job.job_is_local ? <span className='mini-badge mini-badge-orange mr-1'>Local</span> : ''}
                                        {this.state.job.job_is_online ? <span className='mini-badge mini-badge-purple mr-1'>Link Work</span> : ''}
                                        {this.state.job.job_is_remote ? <span className='mini-badge mini-badge-green mr-1'>Remote</span> : ''}
                                    </div>

                                    <div className='mr-2'><FontAwesomeIcon icon={faMapMarkerAlt} className='text-special mr-1' /> {this.state.job.job_post_country}, {this.state.job.job_post_region}, {this.state.job.job_post_city}</div>
                                </div>
                            </div>
                        </div>

                        <div className='view-details-container'>
                            <div className='mb-1'><FontAwesomeIcon icon={faThList} className='text-special mr-1' /> <strong>Sector:</strong> {this.state.job.job_post_sector}</div>

                            <div className='mb-1'><FontAwesomeIcon icon={faSackDollar} className='text-special mr-1' /> {payment}</div>

                            <div className='mb-1'><FontAwesomeIcon icon={faBullseye} className='text-special mr-1' /> <strong>Number of Positions:</strong> {this.state.job.job_post_position_num}</div>

                            <div className='mb-1'><FontAwesomeIcon icon={faCalendarTimes} className='text-special mr-1' /> <strong>Post Expires:</strong> {moment(this.state.job.job_post_expiration_date).format('MM-DD-YYYY')}</div>

                            <div className='mb-1'><FontAwesomeIcon icon={faInfoSquare} className='text-special mr-1' /> <strong>Position:</strong> {this.state.job.job_post_type}</div>
                        </div>
                    </div>

                    <div className='simple-container no-bg mb-3'>
                        <div className='simple-container-title'>Details</div>

                        <div className='keep-format'>
                            {this.state.job.job_post_details}
                        </div>
                    </div>

                    <div className='d-flex-between-center'>
                        <div className='view-buttons'>
                            {this.state.job.user_facebook ? <a href={this.state.job.user_facebook} rel='noopener noreferrer' target='_blank' className='view-button'><FontAwesomeIcon icon={faFacebook} /></a> : ''}
                            {this.state.job.user_twitter ? <a href={this.state.job.user_twitter} rel='noopener noreferrer' target='_blank' className='view-button'><FontAwesomeIcon icon={faTwitter} /></a> : ''}
                            {this.state.job.user_github ? <a href={this.state.job.user_github} rel='noopener noreferrer' target='_blank' className='view-button'><FontAwesomeIcon icon={faGithub} /></a> : ''}
                            {this.state.job.user_instagram ? <a href={this.state.job.user_instagram} rel='noopener noreferrer' target='_blank' className='view-button'><FontAwesomeIcon icon={faInstagram} /></a> : ''}
                            {this.state.job.user_linkedin ? <a href={this.state.job.user_linkedin} rel='noopener noreferrer' target='_blank' className='view-button'><FontAwesomeIcon icon={faLinkedin} /></a> : ''}
                            {this.state.job.user_website ? <a href={this.state.job.user_website} rel='noopener noreferrer' target='_blank' className='view-button'><FontAwesomeIcon icon={faGlobe} /></a> : ''}
                        </div>

                        {this.props.user.user && this.props.user.user.username !== this.state.job.job_post_user
                            ? <div className='view-buttons'>
                                {this.state.status === 'Saving'
                                    ? <FontAwesomeIcon icon={faCircleNotch} spin className='mr-2' />
                                    : <Tooltip text={this.state.saved ? 'Remove from saved' : 'Save job post'} placement='left'><FontAwesomeIcon icon={this.state.saved ? faMinusCircle : faHeart} className={`${this.state.saved ? 'text-danger' : 'text-warning'} view-button mr-2`} onClick={() => this.save(!this.state.saved)} /></Tooltip>
                                }
                                
                                {this.state.status === 'Adding'
                                    ? <FontAwesomeIcon icon={faCircleNotch} spin className='mr-2' />
                                    : <Tooltip text={this.state.isFriend ? 'Remove from friends' : 'Add to friends'} placement='left'><FontAwesomeIcon icon={this.state.isFriend ? faUserMinus : faUserPlus} className='view-button text-alt-highlight mr-2' onClick={() => this.friendUser(this.state.isFriend ? 'remove' : 'add')} /></Tooltip>
                                }

                                {this.state.status === 'Reporting'
                                    ? <FontAwesomeIcon icon={faCircleNotch} spin className='mr-2' />
                                    : this.state.reported
                                        ? <Tooltip text='Reported' placement='left'><FontAwesomeIcon icon={faExclamationTriangle} className='text-dark' /></Tooltip>
                                        : <Tooltip text='Report this posting' placement='left'><FontAwesomeIcon icon={faExclamationTriangle} className='view-button text-warning' onClick={() => this.props.dispatch(ShowSelectionModal(`Select a reason to report this post`, [`Spam`, `Inappropriate`, `Suspicious`], {action: 'report'}))} /></Tooltip>
                                }
                            </div>
                            : ''
                        }
                    </div>

                    <div className='text-right mb-3'><small className='text-dark'>Job Post ID: {this.state.job.job_post_id}</small></div>

                    {application}
                </TitledContainer>
            </section>
        );
    }
}

ViewPostedJob.propTypes = {

};

const mapStateToProps = state => {
    return {
        selection: state.Selection
    }
}

export default withRouter(connect(mapStateToProps)(ViewPostedJob));