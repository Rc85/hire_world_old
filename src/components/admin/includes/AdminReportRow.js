import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/pro-solid-svg-icons';
import { connect } from 'react-redux';
import { ToggleMenu } from '../../../actions/MenuActions';
import Menu from '../../utils/Menu';
import { PromptOpen, PromptReset } from '../../../actions/PromptActions';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';
import Loading from '../../utils/Loading';
import fetch from 'axios';
import { Alert } from '../../../actions/AlertActions';
import { LogError } from '../../utils/LogError';

class AdminReportRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            report: this.props.report || {
                report_id: '',
                reporter: '',
                report_date: '',
                report_from_url: '',
                report_status: '',
                report_type: '',
                reported_user: '',
                reported_id: ''
            },
            showDetails: false,
            review: null
        }
    }
    
    toggleMenu() {
        if (this.props.menu.open === 'admin') {
            this.props.dispatch(ToggleMenu('', 'admin', this.state.report.report_id));
        } else if (this.props.menu.open !== 'admin') {
            this.props.dispatch(ToggleMenu('admin', '', this.state.report.report_id));
        }
    }
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.prompt.data && nextProps.prompt.data.id === this.props.report.report_id && nextProps.prompt.input) {
            if (nextProps.prompt.data.action === 'warning') {
                this.issueWarning(nextProps.prompt.input);
                this.props.dispatch(PromptReset());
            } else if (nextProps.prompt.data.action === 'suspend') {
                this.changeUserStatus('Suspend', nextProps.prompt.input);
                this.props.dispatch(PromptReset());
            } else if (nextProps.prompt.data.action === 'ban') {
                this.changeUserStatus('Ban', nextProps.prompt.input);
                this.props.dispatch(PromptReset());
            }
        }

        if (nextProps.confirm.data && nextProps.confirm.data.id === this.props.report.report_id && nextProps.confirm.option) {
            if (nextProps.confirm.data.action === 'dismiss') {
                this.changeReportStatus('Dismissed');
                this.props.dispatch(ResetConfirmation());
            }

            if (nextProps.confirm.data.action === 'delete review' && nextProps.confirm.data.id === this.props.report.report_id) {
                this.deleteReview();
                this.props.dispatch(ResetConfirmation());
            }
        }
    }
    
    handleMenu(item) {
        if (item === 'Issue Warning') {
            this.props.dispatch(PromptOpen('Enter a warning message', {id: this.state.report.report_id, action: 'warning'}));
        } else if (item === 'Suspend User') {
            this.props.dispatch(PromptOpen('Specify a reason to suspend the reported user', {id: this.state.report.report_id, action: 'suspend'}));
        } else if (item === 'Ban User') {
            this.props.dispatch(PromptOpen('Specify a reason to ban the reported user', {id: this.state.report.report_id, action: 'ban'}));
        } else if (item === 'Dismiss') {
            this.props.dispatch(ShowConfirmation('Are you sure you want to dismiss this report?', false, {id: this.state.report.report_id, action: 'dismiss'}));
        }
    }

    issueWarning(warning) {
        this.props.menuSelect({action: 'warning', warning: warning, user: this.state.report.reported_user, report_id: this.state.report.report_id});
    }

    changeUserStatus(status, reason) {
        this.props.menuSelect({
            action: 'user',
            username: this.state.report.reported_user,
            status: status,
            reason: reason,
            id: this.state.report.report_id,
        });
    }

    changeReportStatus(status) {
        this.props.menuSelect({action: 'report status', status: status, id: this.state.report.report_id});
    }

    fetchReview() {
        this.setState({showDetails: true, status: 'Sending'});

        fetch.post('/api/admin/report/get-review', {id: this.state.report.reported_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', review: resp.data.review});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/admin/report/get-review'));
    }

    deleteReview() {
        this.setState({status: 'Sending'});

        fetch.post('/api/admin/report/delete-review', {id: this.state.report.reported_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', review: resp.data.review});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/admin/report/delete-review'));
    }

    render() {
        let menu, status, reportStatusClass, sourceText, details;

        if (this.state.status === 'Sending') {
            status = <Loading size='5x' />;
        }

        if (this.props.menu.open === 'admin' && this.props.menu.id === this.state.report.report_id) {
            menu = <Menu items={['Dismiss', 'Issue Warning', 'Suspend User', 'Ban User']} onClick={(item) => this.handleMenu(item)} />;
        }        

        if (!this.state.report) {
            return null;
        }

        if (this.state.report.report_status === 'Pending') {
            reportStatusClass = 'badge-warning';
        } else if (this.state.report.report_status === 'Dismissed') {
            reportStatusClass = 'badge-secondary';
        } else if (this.state.report.report_status === 'Banned') {
            reportStatusClass = 'badge-danger';
        } else if (this.state.report.report_status === 'Warned') {
            reportStatusClass = 'badge-info';
        } else if (this.state.report.report_status === 'Suspended') {
            reportStatusClass = 'badge-warning';
        }

        if (this.state.report.report_type === 'Review') {
            if (this.state.showDetails) {
                sourceText = <button className='btn btn-info btn-sm' onClick={() => this.setState({showDetails: false})}>Collapse</button>;

                if (this.state.review) {
                    details = <div className='admin-review-detail bordered-container rounded mb-3'>
                        <div className='d-flex-between-center'>
                            <div>Review by <NavLink to={`/user/${this.state.review.reviewer}`}>{this.state.review.reviewer}</NavLink> | Submitted on {moment(this.state.review.review_date).format('MMM DD YYYY')} {this.state.review.review_modified_date ? '(Modified)' : ''}{this.state.review.review_status === 'Deleted' ? <React.Fragment> | <span className='badge badge-danger'>{this.state.review.review_status}</span></React.Fragment> : '' }</div>

                            {this.state.review.review_status !== 'Deleted' ? <button className='btn btn-danger btn-sm' onClick={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to delete this review?`, `Deleting reviews will not impact the user's rating`, {action: 'delete review', id: this.state.report.report_id}))}>Delete</button> : ''}
                        </div>
                        
                        <hr/>

                        <div className='keep-formatting'>{this.state.review.review}</div>
                    </div>;
                } else {
                    details = <div className='admin-review-detail bordered-container rounded mb-3'></div>;
                }
            } else {
                sourceText = <button className='btn btn-info btn-sm' onClick={() => this.fetchReview()}>Expand</button>;
            }
        } else {
            sourceText = <NavLink to={`${this.state.report.report_from_url}`}>{this.state.report.report_from_url}</NavLink>;
        }

        return (
            <React.Fragment>
                <div className='d-flex-between-center mb-3'>
                    {status}
                    <div className='w-5'>{this.state.report.report_id}</div>
                    <div className='w-15 truncate-text'>{sourceText}</div>
                    <div className='w-15'>{this.state.report.reported_id}</div>
                    <div className='w-15'>{this.state.report.reported_user}</div>
                    <div className='w-15'>{this.state.report.reporter}</div>
                    <div className='w-15'>{moment(this.state.report.report_date).format('MM-DD-YYYY')}</div>
                    <div className='w-10'><span className={`badge ${reportStatusClass}`}>{this.state.report.report_status}</span></div>
                    <div className='w-10 text-right position-relative'>
                        {this.props.type ? <button className='btn btn-info btn-sm admin-menu-button' onClick={() => this.toggleMenu()}>{this.props.menu.open === 'admin' ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}</button> : ''}
                        {menu}
                    </div>
                </div>

                {details}
            </React.Fragment>
        )
    }
}

AdminReportRow.propTypes = {
    report: PropTypes.object.isRequired,
    menuSelect: PropTypes.func,
    type: PropTypes.string
};

const mapStateToProps = state => {
    return {
        menu: state.Menu,
        prompt: state.Prompt,
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(AdminReportRow);