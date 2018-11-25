import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'axios';
import Loading from '../utils/Loading';
import Response from '../pages/Response';
import AdminReportRow from './includes/AdminReportRow';
import { connect } from 'react-redux';
import { Alert } from '../../actions/AlertActions';
import { LogError } from '../utils/LogError';

class AdminReports extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            statusMessage: '',
            reports: [],
            showing: 'User'
        }
    }
    
    componentDidMount() {
        this.getReports('User');
    }

    getReports(type) {
        this.setState({status: 'Sending', showing: type, reports: []});

        fetch.post('/api/admin/reports/get', {type: type})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', reports: resp.data.reports});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/admin/reports/get'));
    }

    handleMenuSelect(data) {
        this.setState({status: 'Sending'});

        if (data.action === 'warning') {
            fetch.post('/api/admin/user/warn', {user: data.user, warning: data.warning, report_id: data.report_id})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.getReports(this.state.showing);
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                }

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            })
            .catch(err => LogError(err, '/api/admin/user/warn'));
        } else if (data.action === 'user') {
            (async() => {
                let user, report, successMessage;
    
                if (status === 'Suspend') {
                    successMessage = 'User suspended';
                } else if (status === 'Ban') {
                    successMessage = 'User banned';
                }
    
                try {
                    user = await fetch.post('/api/admin/user/change-status', {username: data.username, column: 'Status', val: data.status, reason: data.reason})
                    .then(resp => {
                        if (resp.data.status === 'success') {
                            return 'success';
                        } else if (resp.data.status === 'error') {
                            let error = new Error('change user status failed');
                            error.url = '/api/admin/user/change-status';
                            throw error;
                        }
                    })
                    .catch(err => {
                        throw err;
                    });
    
                    report = await fetch.post('/api/admin/report/change-status', {id: data.id, status: data.status, user: data.username})
                    .then(resp => {
                        if (resp.data.status === 'success') {
                            return 'success';
                        } else if (resp.data.status === 'error') {
                            let error = new Error('change report status failed');
                            error.url = '/api/admin/report/change-status';
                            throw error;
                        }
                    })
                    .catch(err => {
                        throw err;
                    });
                } catch (e) {
                    throw e;
                }
    
                if (user === 'success' && report === 'success') {
                    this.getReports(this.state.showing);
                    this.props.dispatch(Alert('success', successMessage));
                } else {
                    this.setState({status: ''});
                    this.props.dispatch(Alert('error', 'An error occurred'));
                }
            })()
            .catch(err => LogError(err, err.url));
        } else if (data.action === 'report status') {
            fetch.post('/api/admin/report/change-status', {id: data.id, status: data.status})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.getReports(this.state.showing);
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                }
                
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            })
            .catch(err => LogError(err, '/api/admin/report/change-status'));
        }
    }
    
    render() {
        let status;

        if (this.state.status === 'Loading') {
            return <Loading size='7x' />;
        } else if (this.state.status === 'Sending') {
            status = <Loading size='5x' />;
        }

        let reports = this.state.reports.map((report, i) => {
            return <AdminReportRow key={i} report={report} menuSelect={(data) => this.handleMenuSelect(data)} type={this.state.showing} />;
        });

        return (
            <div className='blue-panel shallow three-rounded'>
                {status}
                <div className='d-flex-start'>
                    <button className={`btn ${!this.state.showing ? 'btn-info' : 'btn-secondary'} mr-1`} onClick={() => this.getReports()}>Completed</button>
    
                    <div className='btn-group mb-5' role='group' aria-label='Reports'>
                        <button className={`btn ${this.state.showing === 'User' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.getReports('User')}>Users</button>
                        <button className={`btn ${this.state.showing === 'Review' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.getReports('Review')}>Reviews</button>
                        <button className={`btn ${this.state.showing === 'Listing' ? 'btn-info' : 'btn-secondary'}`} onClick={() => this.getReports('Listing')}>Listings</button>
                    </div>
                </div>

                <div className='d-flex-between-center'>
                    <div className='w-5'><strong>ID</strong></div>
                    <div className='w-15'><strong>Source</strong></div>
                    <div className='w-15'><strong>Reported ID</strong></div>
                    <div className='w-15'><strong>Reported User</strong></div>
                    <div className='w-15'><strong>Reported By</strong></div>
                    <div className='w-15'><strong>Report Date</strong></div>
                    <div className='w-10'></div>
                    <div className='w-10'></div>
                </div>

                <hr/>

                {reports}
            </div>
        );
    }
}

AdminReports.propTypes = {
    user: PropTypes.object
};

export default connect()(AdminReports);