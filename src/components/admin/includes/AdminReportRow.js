import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { ToggleMenu } from '../../../actions/MenuActions';
import Menu from '../../utils/Menu';
import { PromptOpen, PromptReset } from '../../../actions/PromptActions';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';
import Loading from '../../utils/Loading';
import fetch from 'axios';
import { Alert } from '../../../actions/AlertActions';

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
            }
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
        /* this.setState({status: 'Sending'});

        fetch.post('/api/admin/user/warn', {user: this.state.report.reported_user, warning: warning, report_id: this.state.report.report_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: ''});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => console.log(err)); */
    }

    changeUserStatus(status, reason) {
        this.props.menuSelect({
            action: 'user',
            username: this.state.report.reported_user,
            status: status,
            reason: reason,
            id: this.state.report.report_id,
        })
        /* this.setState({status: 'Sending'});

        (async() => {
            let user, report, successMessage;

            if (status === 'Suspend') {
                successMessage = 'User suspended';
            } else if (status === 'Ban') {
                successMessage = 'User banned';
            }

            try {
                user = await fetch.post('/api/admin/user/change-status', {username: this.state.report.reported_user, column: 'Status', val: status, reason: reason})
                .then(resp => {
                    if (resp.data.status === 'success') {
                        return 'success';
                    } else if (resp.data.status === 'error') {
                        throw new Error('error');
                    }
                })
                .catch(err => {
                    throw new Error(err);
                });

                report = await fetch.post('/api/admin/report/change-status', {id: this.state.report.report_id, status: status, user: this.state.report.reported_user})
                .then(resp => {
                    if (resp.data.status === 'success') {
                        return 'success';
                    } else if (resp.data.status === 'error') {
                        throw new Error('error');
                    }
                })
                .catch(err => {
                    throw new Error(err);
                });
            } catch (e) {
                throw e;
            }

            if (user === 'success' && report === 'success') {
                this.setState({status: ''});
                this.props.dispatch(Alert('success', successMessage));
            } else {
                this.setState({status: ''});
                this.props.dispatch(Alert('error', 'An error occurred'));
            }
        })()
        .catch(err => console.log(err)); */
    }

    changeReportStatus(status) {
        this.props.menuSelect({action: 'report status', status: status, id: this.state.report.report_id});
    }

    render() {
        let menu, status, reportStatusClass;

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

        return (
            <div className='d-flex-between-center mb-3'>
                {status}
                <div className='w-5'>{this.state.report.report_id}</div>
                <div className='w-15 truncate-text'><NavLink to={`${this.state.report.report_from_url}`}>{this.state.report.report_from_url}</NavLink></div>
                <div className='w-15'>{this.state.report.reported_id}</div>
                <div className='w-15'>{this.state.report.reported_user}</div>
                <div className='w-15'>{this.state.report.reporter}</div>
                <div className='w-15'>{moment(this.state.report.report_date).format('MM-DD-YYYY')}</div>
                <div className='w-10'><span className={`badge ${reportStatusClass}`}>{this.state.report.report_status}</span></div>
                <div className='w-10 text-right position-relative'>
                    {this.props.type ? <button className='btn btn-info btn-sm admin-menu-button' onClick={() => this.toggleMenu()}><FontAwesomeIcon icon={faCaretDown} /></button> : ''}
                    {menu}
                </div>
            </div>
        )
    }
}

AdminReportRow.propTypes = {

};

const mapStateToProps = state => {
    return {
        menu: state.Menu,
        prompt: state.Prompt,
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(AdminReportRow);