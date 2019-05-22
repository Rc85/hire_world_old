import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../components/utils/TitledContainer';
import { faFolderOpen, faCircleNotch, faUserCircle, faThList, faCalendarAlt } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LogError } from '../components/utils/LogError';
import { connect } from 'react-redux';
import fetch from 'axios';
import Loading from '../components/utils/Loading';
import Row from '../components/Row';
import { NavLink, Redirect } from 'react-router-dom';
import Username from '../components/Username';
import SlideToggle from '../components/utils/SlideToggle';
import moment from 'moment';
import { Alert } from '../actions/AlertActions';
import Pagination from '../components/utils/Pagination';

class PostedJobs extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            jobs: [],
            offset: 0
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.offset !== this.state.offset) {
            this.setState({status: 'Fetching'});
            
            fetch.post('/api/get/posted/jobs', {offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', jobs: resp.data.jobs, totalPosts: parseInt(resp.data.totalPosts)});
                } else if (resp.data.status === 'error') {
                    this.setState({status: 'error'});
                }
            })
            .catch(err => {
                LogError(err, '/api/get/posted/jobs');
                this.setState({status: 'error'});
            });
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/posted/jobs', {offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', jobs: resp.data.jobs, totalPosts: parseInt(resp.data.totalPosts)});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/posted/jobs');
            this.setState({status: 'error'});
        });
    }

    toggleJob(id, status, index) {
        this.setState({status: `Toggling ${id}`});

        let newStatus;

        if (status === 'Active') {
            newStatus = 'Inactive';
        } else if (status === 'Inactive') {
            newStatus = 'Active';
        }

        fetch.post('/api/posted/job/toggle', {id: id, status: newStatus, user: this.props.user.user.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                let jobs = [...this.state.jobs];
                jobs[index].job_post_status = newStatus;

                this.setState({status: '', jobs: jobs});
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

    handlePagination(i) {
        this.setState({offset: i * 25});
    }
    
    render() {
        let status;

        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        } else if (this.state.status === 'Loading') {
            return <Loading size='7x' color='black' />;
        } else if (this.state.status === 'error') {
            return <Redirect to='/error/app/500' />;
        } else if (this.state.status === 'Fetching') {
            status = <FontAwesomeIcon icon={faCircleNotch} size='5x' spin />;
        }
        
        if (this.props.user.user) {
            return (
                <section id='posted-jobs' className='main-panel'>
                    <TitledContainer title='Posted Jobs' bgColor='violet' icon={<FontAwesomeIcon icon={faFolderOpen} />} shadow>
                        {status}
                        {this.state.totalPosts > 0 ? <React.Fragment>
                            <Pagination totalItems={this.state.totalPosts} currentPage={this.state.offset / 25} itemsPerPage={25} onClick={this.handlePagination.bind(this)} />
                            <hr/>
                        </React.Fragment> : ''}
                        {this.state.jobs.map((job, i) => {
                            let local, remote, online;

                            if (job.job_is_local) {
                                local = <span className='mini-badge mini-badge-orange mr-1'>Local</span>;
                            }
                    
                            if (job.job_is_remote) {
                                remote = <span className='mini-badge mini-badge-green mr-1'>Remote</span>;
                            }
                    
                            if (job.job_is_online) {
                                online = <span className='mini-badge mini-badge-purple mr-1'>Online</span>;
                            }

                            return <Row
                            key={job.job_post_id}
                            index={i}
                            length={this.state.jobs.length}
                            title={
                                <React.Fragment>
                                    <span className='mr-2'>{local} {online} {remote}</span>
                                    <NavLink to={`/dashboard/posted/job/details/${job.job_post_id}`}>{job.job_post_title}</NavLink>
                                </React.Fragment>
                            }
                            details={
                                <React.Fragment>
                                    <div className='row-detail'><FontAwesomeIcon icon={faUserCircle} className='text-special mr-1' /> {job.job_post_as_user ? <Username username={job.job_post_user} color='alt-highlight' /> : <NavLink to={job.job_post_company_website}>{job.job_post_company}</NavLink>}</div>
                                    <div className='row-detail'><FontAwesomeIcon icon={faThList} className='text-special mr-1' /> {job.job_post_sector}</div>
                                    <div className='row-detail'><FontAwesomeIcon icon={faCalendarAlt} className='text-special mr-1' /> {moment(job.job_post_date).format('MM-DD-YYYY')}</div>
                                </React.Fragment>
                            }
                            buttons={<React.Fragment>{this.state.status === `Toggling ${job.job_post_id}` ? <FontAwesomeIcon icon={faCircleNotch} spin className='mr-1' /> : ''}
                            <SlideToggle status={job.job_post_status === 'Active'} onClick={() => this.toggleJob(job.job_post_id, job.job_post_status, i)} /></React.Fragment>}
                            />
                        })}
                        {this.state.totalPosts > 0 ? <React.Fragment>
                            <hr/>
                            <Pagination totalItems={this.state.totalPosts} currentPage={this.state.offset / 25} itemsPerPage={25} onClick={this.handlePagination.bind(this)} />
                        </React.Fragment> : ''}
                    </TitledContainer>
                </section>
            );
        }

        return <Loading size='7x' color='black' />
    }
}

PostedJobs.propTypes = {
    user: PropTypes.object,
    sectors: PropTypes.array
};

export default connect()(PostedJobs);