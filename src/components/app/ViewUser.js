import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ViewUserContacts from '../includes/page/ViewUserContacts';
import ViewUserProfile from '../includes/page/ViewUserProfile';
import { withRouter, Redirect } from 'react-router-dom';
import fetch from 'axios';
import Loading from '../utils/Loading';
import ViewUserReviews from '../includes/page/ViewUserReviews';
import { Alert } from '../../actions/AlertActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faEye, faExclamationTriangle, faHeart, faCoins, faUserPlus, faUserMinus, faBan, faUser } from '@fortawesome/pro-solid-svg-icons';
import ViewUserBusinessHours from '../includes/page/ViewUserBusinessHours';
import { connect } from 'react-redux';
import { LogError } from '../utils/LogError';
import MessageSender from '../includes/page/MessageSender';
import { faCheckCircle, faTimesCircle } from '@fortawesome/pro-regular-svg-icons';
import TitledContainer from '../utils/TitledContainer';
import Tooltip from '../utils/Tooltip';
import { ShowConfirmation, ResetConfirmation } from '../../actions/ConfirmationActions';
import JobProposal from '../includes/page/JobProposal';
import ViewUserWorkHistory from '../includes/page/ViewUserWorkHistory';
import { ShowLoading, HideLoading } from '../../actions/LoadingActions';
import { ShowSelectionModal, ResetSelection, ResetSelectionConfirm } from '../../actions/SelectModalActions';

class ViewUser extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            status: 'Loading',
            hours: {},
            userReported: false,
            isFriend: false,
            isBlocked: false,
            jobs: [],
            message: '',
            stats: {
                view_count: 0,
                job_complete: 0,
                job_abandon: 0,
                last_login: null
            }
        }
    }
    
    componentDidUpdate(prevProps) {
        if (prevProps.location.key !== this.props.location.key) {
            this.setState({status: 'Loading'});

            fetch.post('/api/get/user', {username: this.props.match.params.username, id: this.props.match.params.listing_id})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({user: resp.data.user, stats: resp.data.stats, hours: resp.data.hours, status: '', userReported: resp.data.userReported, isFriend: resp.data.isFriend, jobs: resp.data.jobs, isBlocked: resp.data.isBlocked});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                } else if (resp.data.status === 'access error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => LogError(err, '/api/get/user'));
        }

        if (this.props.selection.data.action) {
            if (!prevProps.selection.selected && !this.props.selection.selected && this.props.selection.confirm) {
                this.props.dispatch(Alert('error', 'Please select a reason'));
                this.props.dispatch(ResetSelectionConfirm());
            } else if (this.props.selection.confirm !== prevProps.selection.confirm) {
                if (this.props.selection.data.action === 'report user' && this.props.selection.selected && this.props.selection.confirm) {
                    this.submitReport(this.props.selection.selected, this.props.selection.specified);
                    this.props.dispatch(ResetSelection());
                }
            }
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/user', {username: this.props.match.params.username, id: this.props.match.params.listing_id, url: this.props.location.pathname})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({user: resp.data.user, stats: resp.data.stats, hours: resp.data.hours, status: '', userReported: resp.data.userReported, isFriend: resp.data.isFriend, jobs: resp.data.jobs, isBlocked: resp.data.isBlocked});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            } else if (resp.data.status === 'access error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/user')
        });
    }

    submitReport(reason, specified) {
        this.props.dispatch(ShowLoading('Sending report'));

        fetch.post('/api/report/submit', {url: this.props.location.pathname, type: 'User Profile', reason: reason, specified: specified === '' ? null : specified})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({userReported: true});
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

    sendMessage(message, verified, subject) {
        this.setState({sendStatus: 'Sending'});

        fetch.post('/api/conversation/submit', {subject: subject, message: message, user: this.state.user.username, verified: verified})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', sendStatus: 'send success', message: ''});
            } else if (resp.data.status === 'send error' || resp.data.status === 'error') {
                this.setState({status: '', sendStatus: resp.data.status});
            }

            setTimeout(() => {
                this.setState({sendStatus: ''});
            }, 5000);

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            this.setState({status: '', sendStatus: 'error'});
            this.props.dispatch(Alert('error', 'An error occurred'));
            LogError(err, '/api/conversation/submit');
        });
    }

    friendUser(action) {
        this.setState({status: 'Adding'});

        fetch.post('/api/user/friend', {user: this.state.user.username, action: action})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', isFriend: action === 'add'});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        }).catch(err => {
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
            LogError(err, '/api/user/friend');
        });
    }

    blockUser(action) {
        this.setState({status: 'Blocking'});

        fetch.post('/api/user/block', {user: this.state.user.username, action: action})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', isBlocked: action === 'block'});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            this.setState({status: ''});
            LogError(err, '/api/user/block');
        });
    }

    submitProposal(data) {
        this.setState({status: 'Submitting Proposal'});

        fetch.post('/api/job/create', {...data, user: this.state.user.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', message: ''});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/job/create');
            this.setState({status: ''});
        });
    }

    render() {
        let contacts, profile, reportButton, message, friendIcon, businessHours, jobs, blockIcon;

        if (this.state.status === 'access error') {
            return <Redirect to={`/error/listing/404`} />
        } else if (this.state.status === 'Loading') {
            return <Loading size='7x' />;
        } else if (this.state.status === 'redirect') {
            return <Redirect to='/main' />;
        }

        if (this.state.user) {
            contacts = <ViewUserContacts user={this.state.user} />;
            profile = <ViewUserProfile user={this.state.user} stats={this.state.stats} hours={this.state.hours} />;

            if (this.state.user.display_business_hours) {
                businessHours = <ViewUserBusinessHours hours={this.state.hours} />;
            }

            if (this.props.user.user && this.props.user.user.username !== this.state.user.username) {
                if (!this.state.isFriend) {
                    friendIcon = <Tooltip text='Add to Friends List' placement='bottom-right'><FontAwesomeIcon icon={faUserPlus} className='view-button text-alt-highlight mr-2' onClick={() => this.friendUser('add')} /></Tooltip>;
                } else {
                    friendIcon = <Tooltip text='Remove from Friends List' placement='bottom-right'><FontAwesomeIcon icon={faUserMinus} className='view-button text-alt-highlight mr-2' onClick={() => this.friendUser('remove')} /></Tooltip>
                }

                if (!this.state.isBlocked) {
                    blockIcon = <Tooltip text='Block User' placement='bottom-right'><FontAwesomeIcon icon={faTimesCircle} className='view-button text-dark mr-2' onClick={() => this.blockUser('block')} /></Tooltip>
                } else {
                    blockIcon = <Tooltip text='Unblock User' placement='bottom-right'><FontAwesomeIcon icon={faTimesCircle} className='view-button text-danger mr-2' onClick={() => this.blockUser('unblock')} /></Tooltip>
                }
                
                if (!this.state.userReported) {
                    reportButton = <Tooltip text='Report this listing' placement='bottom-right'><FontAwesomeIcon icon={faExclamationTriangle} className='view-button text-warning' onClick={() => this.props.dispatch(ShowSelectionModal(`Please select a reason`, ['Spam', 'Suspicious', 'Duplicate', 'Impersonating', 'Inappropriate'], {action: 'report user'}))} /></Tooltip>;
                } else {
                    reportButton = <Tooltip text='Reported' placement='bottom-right'><FontAwesomeIcon icon={faExclamationTriangle} className='text-dark' /></Tooltip>;
                }

                if (this.state.message === 'message') {
                    if (this.state.user.username !== this.props.user.user.username) {
                        message = <React.Fragment>
                            <hr/>

                            <MessageSender send={(message, verified, subject) => this.sendMessage(message, verified, subject)} status={this.state.sendStatus} className='mt-4' cancel={() => this.setState({message: ''})} withSubject />
                        </React.Fragment>
                        ;
                    }
                } else if (this.state.message === 'propose a job') {
                    message = <React.Fragment>
                        <hr/>
                        
                        <JobProposal className='mt-4' cancel={() => this.setState({message: ''})} submit={(data) => this.submitProposal(data)} status={this.state.status} />
                    </React.Fragment>;
                }
            }
        }
        
        return(
            <div id='view-user' className='main-panel'>
                <div id='view-user-details-container'>
                    <div id='view-user-main'>
                        {<TitledContainer title={this.state.user ? this.state.user.username : ''} bgColor='yellow' icon={<FontAwesomeIcon icon={faUserCircle} />} shadow>
                            {profile}

                            {this.props.user.user && this.state.user && this.props.user.user.username !== this.state.user.username ?
                                <div className='text-right'>
                                    {this.state.message != 'message' && this.state.user.allow_messaging ? <button className='btn btn-primary' onClick={() => this.setState({message: 'message'})}>Message</button> : ''}
                                    {this.state.message != 'propose a job' && this.state.user && this.state.user.link_work_acct_status === 'Approved' && new Date(this.state.user.subscription_end_date) > new Date() ? <button className='btn btn-success' onClick={() => this.setState({message: 'propose a job'})}>Start A Job</button> : ''}
                                </div>
                            : ''}

                            {message}

                            <hr/>
                            
                            <div id='view-user-footer'>
                                <div id='view-user-stats'>
                                    <div className='mr-5'>
                                        <Tooltip text='Job completed' placement='bottom'>
                                            <FontAwesomeIcon icon={faCheckCircle} className='text-success mr-2' />
                                            <span>{this.state.stats.job_complete}</span>
                                        </Tooltip>
                                    </div>
                        
                                    <div className='mr-5'>
                                        <Tooltip text='Job abandoned' placement='bottom'>
                                            <FontAwesomeIcon icon={faBan} className='text-danger mr-2' />
                                            <span>{this.state.stats.job_abandon}</span>
                                        </Tooltip>
                                    </div>
        
                                    <div className='mr-5'>
                                        <Tooltip text='Views' placement='bottom'>
                                            <FontAwesomeIcon icon={faEye} className='mr-2' />
                                            <span>{this.state.stats.view_count}</span>
                                        </Tooltip>
                                    </div>
                                </div>
        
                                <div className='view-buttons'>
                                    {friendIcon}
                                    {blockIcon}
                                    {reportButton}
                                </div>
                            </div>
                        </TitledContainer>}
                    </div>

                    <div id='view-user-details'>
                        {contacts}
                        {businessHours}
                        <ViewUserWorkHistory user={this.state.user.username} />
                    </div>

                    <ViewUserReviews username={this.props.match.params.username} user={this.props.user} listingId={this.props.match.params.listing_id} />
                </div>
            </div>
        )
    }
}

ViewUser.propTypes = {
    user: PropTypes.object
}

const mapStateToProps = state => {
    return {
        user: state.Login,
        confirm: state.Confirmation,
        selection: state.Selection
    }
}

export default withRouter(connect(mapStateToProps)(ViewUser));