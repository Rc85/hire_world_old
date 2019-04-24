import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePlus, faSatellite, faFileAlt, faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
import { connect } from 'react-redux';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import { Alert } from '../../actions/AlertActions';
import PostJobForm from '../includes/page/PostJobForm';
import SubmitButton from '../utils/SubmitButton';
import { withRouter, NavLink } from 'react-router-dom';
import SlideToggle from '../utils/SlideToggle';
import moment from 'moment';

class EditPostedJob extends Component {
    constructor(props) {
        super(props);

        this.initialState = {
            status: '',
            title: '',
            sector: 'Agencies',
            budgetThreshold: '',
            budget: '',
            company: null,
            website: null,
            postAsUser: true,
            local: false,
            remote: false,
            online: false,
            country: '',
            region: '',
            city: '',
            details: '',
            positions: '1',
            notification: false,
            paymentType: '',
            budgetEnd: null,
            type: '',
            expire: moment().add(1, 'month')
        }
        
        this.state = {
            status: 'Loading',
            title: '',
            sector: 'Agencies',
            budgetThreshold: '',
            budget: '',
            company: null,
            website: null,
            postAsUser: true,
            local: false,
            remote: false,
            online: false,
            country: '',
            region: '',
            city: '',
            postStatus: '',
            details: '',
            positions: '1',
            notification: false,
            paymentType: '',
            budgetEnd: null,
            type: '',
            expire: moment().add(1, 'month')
        }
    }

    componentDidMount() {
        fetch.post('/api/get/posted/job/details', {id: this.props.match.params.id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let state = {
                    status: '',
                    title: resp.data.job.job_post_title,
                    sector: resp.data.job.job_post_sector,
                    budgetThreshold: resp.data.job.job_post_budget_threshold,
                    budget: resp.data.job.job_post_budget,
                    company: resp.data.job.job_post_company,
                    website: resp.data.job.job_post_company_website,
                    postAsUser: resp.data.job.job_post_as_user,
                    local: resp.data.job.job_is_local,
                    remote: resp.data.job.job_is_remote,
                    online: resp.data.job.job_is_online,
                    country: resp.data.job.job_post_country,
                    region: resp.data.job.job_post_region,
                    city: resp.data.job.job_post_city,
                    details: resp.data.job.job_post_details,
                    positions: resp.data.job.job_post_position_num,
                    notification: resp.data.job.job_post_notification,
                    paymentType: resp.data.job.job_post_payment_type,
                    budgetEnd: resp.data.job.job_post_budget_end,
                    type: resp.data.job.job_post_type,
                    expire: moment(resp.data.job.job_post_expiration_date),
                    postStatus: resp.data.job.job_post_status
                }
                this.setState(state);

                delete state.status;
                delete state.postStatus;
                
                this.savedSettings = state;
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/posted/details');
            this.setState({status: 'error'});
        });
    }
    
    update() {
        this.setState({status: 'Updating'});

        return fetch.post('/api/posted/job/update', {...this.state, id: this.props.match.params.id, user: this.props.user.user.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                let state = {
                    status: 'Saved',
                    title: resp.data.job.job_post_title,
                    sector: resp.data.job.job_post_sector,
                    budgetThreshold: resp.data.job.job_post_budget_threshold,
                    budget: resp.data.job.job_post_budget,
                    company: resp.data.job.job_post_company,
                    website: resp.data.job.job_post_company_website,
                    postAsUser: resp.data.job.job_post_as_user,
                    local: resp.data.job.job_is_local,
                    remote: resp.data.job.job_is_remote,
                    online: resp.data.job.job_is_online,
                    country: resp.data.job.job_post_country,
                    region: resp.data.job.job_post_region,
                    city: resp.data.job.job_post_city,
                    details: resp.data.job.job_post_details,
                    positions: resp.data.job.job_post_position_num,
                    notification: resp.data.job.job_post_notification,
                    paymentType: resp.data.job.job_post_payment_type,
                    budgetEnd: resp.data.job.job_post_budget_end,
                    type: resp.data.job.job_post_type,
                    expire: moment(resp.data.job.job_post_expiration_date)
                }

                this.setState(state);

                delete state.status;
                this.savedSettings = state;
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/post/job');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    set(key, val) {
        let obj = {};
        obj[key] = val;

        if (key === 'budgetThreshold' && val === 'To Be Discussed') {
            obj['budget'] = null;
        }

        this.setState(obj);
    }

    toggleJob() {
        this.setState({status: 'Toggling'});

        let status;

        if (this.state.postStatus === 'Active') {
            status = 'Inactive';
        } else if (this.state.postStatus === 'Inactive') {
            status = 'Active';
        }

        fetch.post('/api/posted/job/toggle', {id: this.props.match.params.id, status: status, user: this.props.user.user.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', postStatus: status});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/posted/job/toggle');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }
    
    render() {
        if (this.state.status === 'authorized') {
            return <Redirect to='/error/app/401' />;
        } else if (this.state.status === 'forbidden') {
            return <Redirect to='/error/app/403' />;
        }

        let state = {...this.state};
        
        delete state.status;
        delete state.postStatus;

        return (
            <section id='#post-job' className='main-panel'>
                <TitledContainer title='Edit Job Post' bgColor='lime' icon={<FontAwesomeIcon icon={faFileAlt} />} shadow>
                    <div className='mb-3 d-flex-end-center'>
                        {this.state.status === 'Toggling' ? <FontAwesomeIcon icon={faCircleNotch} spin className='mr-1' /> : ''}
                        <SlideToggle status={this.state.postStatus === 'Active'} onClick={() => this.toggleJob()} className='mr-2' />
                        <NavLink to={`/job/${this.props.match.params.id}`}>View Job</NavLink>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        this.update();
                    }}>
                        <PostJobForm submit={() => this.submit()} set={(key, val) => this.set(key, val)} data={this.state} sectors={this.props.sectors} />

                        <div className='text-right'>
                            <SubmitButton type='submit' loading={this.state.status === 'Updating'} value='Save' disabled={JSON.stringify(this.savedSettings) === JSON.stringify(state)} />
                            <button className='btn btn-secondary' type='button' onClick={() => this.setState({...this.state, ...this.initialState})}>Clear</button>
                            <button className='btn btn-secondary' type='button' onClick={() => this.setState({...this.state, ...this.savedSettings})}>Reset</button>
                        </div>
                    </form>
                </TitledContainer>
            </section>
        );
    }
}

EditPostedJob.propTypes = {

};

export default withRouter(connect()(EditPostedJob));