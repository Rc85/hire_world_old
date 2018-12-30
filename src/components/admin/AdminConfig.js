import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'axios';
import SlideToggle from '../utils/SlideToggle';
import AdminPromoRow from './includes/AdminPromoRow';
import AdminPlanRow from './includes/AdminPlanRow';
import DatePicker from 'react-datepicker';
import { connect } from 'react-redux';
import { Alert } from '../../actions/AlertActions';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Loading from '../utils/Loading';
import { LogError } from '../utils/LogError';

class AdminConfig extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            statusMessage: '',
            site: '',
            registration: '',
            plans: [],
            promotions: [],
            announcements: [],
            announcement: '',
            announcementStart: moment(),
            announcementEnd: moment()
        }
    }
    
    componentDidMount() {
        fetch.post('/api/admin/config/get')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', site: resp.data.configs[0].config_status, registration: resp.data.configs[1].config_status, plans: resp.data.plans, promotions: resp.data.promotions, announcements: resp.data.announcements});
            } else if (resp.data.status === 'access error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => LogError(err, '/api/admin/config/get'));
    }

    toggleSite() {
        this.setState({status: 'Loading'});

        let status;

        if (this.state.site === 'Active') {
            status = 'Inactive';
        } else {
            status = 'Active';
        }

        fetch.post('/api/admin/config/set/site', {status: status})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', site: status});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/admin/config/set/site'));
    }

    toggleRegistration() {
        this.setState({status: 'Loading'});

        let status;

        if (this.state.registration === 'Active') {
            status = 'Inactive';
        } else {
            status = 'Active';
        }

        fetch.post('/api/admin/config/set/registration', {status: status})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', registration: status});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/admin/config/set/registration'));
    }

    setAnnouncementStart(date) {
        this.setState({announcementStart: date});
    }

    setAnnouncementEnd(date) {
        this.setState({announcementEnd: date});
    }

    createAnnouncement() {
        this.setState({status: 'Loading'});

        fetch.post('/api/admin/announcement/create', {announcement: this.state.announcement, start: this.state.announcementStart, end: this.state.announcementEnd})
        .then(resp => {
            if (resp.data.status === 'success') {
                let announcements = this.state.announcements;
                announcements.unshift(resp.data.announcement);

                this.setState({status: '', announcements: announcements, announcement: '', announcementStart: moment(), announcementEnd: moment()});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/admin/announcement/create'));
    }

    deleteAnnouncement(id) {
        let index = this.state.announcements.findIndex(a => a.announcement_id === id);
        this.setState({status: 'Loading'});

        fetch.post('/api/admin/announcement/delete', {id: id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let announcements = this.state.announcements;
                announcements.splice(index, 1);

                this.setState({status: '', announcements: announcements});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/admin/announcement/delete'));
    }

    render() {
        let status, announcementsHeader, promotions, plans;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        if (this.props.user.user && this.props.user.user.user_level === 99) {
            promotions = <React.Fragment><div className='admin-scroller-header mb-3'>
                    <div className='w-5'>ID</div>
                    <div className='w-15'>Name</div>
                    <div className='w-15'>Start Date</div>
                    <div className='w-15'>End Date</div>
                    <div className='w-15'>Code</div>
                    <div className='w-25'>Description</div>
                    <div className='w-5 text-center'>Status</div>
                    <div className='w-5'></div>
                </div>
                
                <div className='position-relative scroller-div h-200 rounded mb-5'>
                    {this.state.promotions.map((promo, i) => {
                        return <AdminPromoRow key={i} promo={promo} />;
                    })}
                </div>
            </React.Fragment>

            plans = <React.Fragment>
                <div className='admin-scroller-header h-200 mb-3'>
                    <div className='w-5'>ID</div>
                    <div className='w-40'>Name</div>
                    <div className='w-25'>Price</div>
                    <div className='w-25'>Created</div>
                    <div className='w-5 text-center'>Status</div>
                    <div className='w-5'></div>
                </div>

                <div className='position-relative scroller-div rounded mb-5'>
                    {this.state.plans.map((plan, i) => {
                        return <AdminPlanRow key={i} plan={plan} />;
                    })}
                </div>
            </React.Fragment>
        }

        let announcements = this.state.announcements.map((a, i) => {
            return <div key={i} className='d-flex-between-center mb-3'>
                <div className='w-35 keep-formatting'>{a.announcement}</div>
                <div className='w-15'>{a.announcer}</div>
                <div className='w-15'>{moment(a.announcement_created_date).format('MM-DD-YYYY')}</div>
                <div className='w-15'>{moment(a.announcement_start_date).format('MM-DD-YYYY')}</div>
                <div className='w-15'>{moment(a.announcement_end_date).format('MM-DD-YYYY')}</div>
                <div className='w-5 text-right'><button className='btn btn-secondary btn-sm' onClick={() => this.deleteAnnouncement(a.announcement_id)}><FontAwesomeIcon icon={faTrash} /></button></div>
            </div>
        });

        if (this.state.announcements.length > 0) {
            announcementsHeader = <React.Fragment>
                <div className='d-flex-between-center'>
                    <div className='w-35'><strong>Announcement</strong></div>
                    <div className='w-15'><strong>Created By</strong></div>
                    <div className='w-15'><strong>Created Date</strong></div>
                    <div className='w-15'><strong>Start Date</strong></div>
                    <div className='w-15'><strong>End Date</strong></div>
                    <div className='w-5'></div>
                </div>

                <hr/>
            </React.Fragment>
        }

        return (
            <div className='blue-panel shallow three-rounded'>
                {status}
                <div className='d-flex-between-center mb-5'>
                    <div className='w-45'><label htmlFor='site-config' className='d-flex-between-center'>Site Status: <SlideToggle status={this.state.site === 'Active'} onClick={() => this.toggleSite()} /></label></div>
                    <div className='w-45'><label htmlFor='registration-config' className='d-flex-between-center'>Registration Status: <SlideToggle status={this.state.registration === 'Active'} onClick={() => this.toggleRegistration()} /></label></div>
                </div>

                <div className='bordered-container rounded mb-5'>
                    {announcementsHeader}

                    {announcements}
    
                    <div className='d-flex-between-center mb-1'>
                        <div className='w-45'>
                            <label htmlFor='announcement'>Announcement:</label>
                            <input type='text' name='announcement' id='announcement' className='form-control' onChange={(e) => this.setState({announcement: e.target.value})} value={this.state.announcement} />
                        </div>
    
                        <div className='d-flex-between-center w-45'>
                            <div className='w-50'>
                                <label htmlFor='start_date'>Start Date:</label>
                                <DatePicker className='form-control' onChange={this.setAnnouncementStart.bind(this)} selected={this.state.announcementStart} />
                            </div>
    
                            <div className='w-50 d-flex-end-center'>
                                <div>
                                    <label htmlFor='end_date'>End Date:</label>
                                    <DatePicker className='form-control' onChange={this.setAnnouncementEnd.bind(this)} selected={this.state.announcementEnd} />
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <div className='text-right'><button className='btn btn-primary' onClick={() => this.createAnnouncement()}>Create</button></div>
                    <small>Only 3 announcements are allowed</small>
                </div>

                {promotions}

                {plans}
            </div>
        );
    }
}

AdminConfig.propTypes = {
    user: PropTypes.object
}

export default connect()(AdminConfig);