import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBuilding, faUser, faThList, faCalendarAlt, faTrash } from '@fortawesome/pro-solid-svg-icons';
import { LogError } from '../utils/LogError';
import Loading from '../utils/Loading';
import fetch from 'axios';
import Row from '../includes/page/Row';
import Username from '../includes/page/Username';
import moment from 'moment';
import { NavLink, Redirect } from 'react-router-dom';
import SubmitButton from '../utils/SubmitButton';
import { Alert } from '../../actions/AlertActions';
import { connect } from 'react-redux';

class SavedPosts extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            jobs: []
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/saved/jobs')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', jobs: resp.data.jobs});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/saved/jobs');
            this.setState({status: 'error'});
        });
    }

    removePost(id, index) {
        this.setState({status: `Removing ${id}`});

        fetch.post('/api/saved/job/remove', {id: id, user: this.props.user.user.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                let jobs = [...this.state.jobs];
                jobs.splice(index, 1);

                this.setState({status: '', jobs: jobs});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/saved/job/remove');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }
    
    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        }

        if (this.props.user.user) {
            return (
                <section id='saved-posts' className='main-panel'>
                    <TitledContainer title='Saved Posts' icon={<FontAwesomeIcon icon={faSave} />} shadow bgColor='lightblue'>
                        {this.state.status === 'error' ? <div className='text-center'><h5>Error retrieving saved jobs</h5></div> : ''}

                        {this.state.jobs.map((job, i) => {
                            return <Row
                            key={job.job_post_id}
                            index={i}
                            length={this.state.jobs.length}
                            title={
                                <React.Fragment>
                                    {job.job_is_local ? <span className='mini-badge mini-badge-orange mr-1'>Local</span> : ''}
                                    {job.job_is_online ? <span className='mini-badge mini-badge-purple mr-1'>Online</span> : ''}
                                    {job.job_is_remote ? <span className='mini-badge mini-badge-green mr-1'>Remote</span> : ''}
                                    <NavLink to={`/job/${job.job_post_id}`}>{job.job_post_title}</NavLink>
                                </React.Fragment>
                            }
                            details={
                                <React.Fragment>
                                    {!job.job_post_as_user && job.job_post_company 
                                        ? <div className='mr-2'><small><FontAwesomeIcon icon={faBuilding} className='text-special mr-1' /> {job.job_post_company_website 
                                            ? <a href={job.job_post_company_website} rel='noopener noreferrer' target='_blank'><FontAwesomeIcon icon={faBuilding} className='text-special mr-1' /> {job.job_post_company}</a> 
                                            : job.job_post_company}</small>
                                        </div> 
                                        : <div className='mr-2'><small><FontAwesomeIcon icon={faUser} className='text-special mr-1' /> <Username username={job.job_post_user} /></small></div>
                                    }
                                    <div className='mr-2'><small><FontAwesomeIcon icon={faThList} className='text-special mr-1' /> {job.job_post_sector}</small></div>
                                    <div className='mr-2'><small><FontAwesomeIcon icon={faCalendarAlt} className='text-special mr-1' /> Applied on {moment(job.applied_date).format('MM-DD-YYYY')}</small></div>
                                </React.Fragment>
                            }
                            buttons={
                                <SubmitButton type='button' loading={this.state.status === `Removing ${job.job_post_id}`} value={<FontAwesomeIcon icon={faTrash} />} bgColor='secondary' onClick={() => this.removePost(job.job_post_id, i)} />
                            }
                            />
                        })}
                    </TitledContainer>
                </section>
            );
        }
        
        return <Loading size='7x' color='black' />
    }
}

SavedPosts.propTypes = {

};

export default connect()(SavedPosts);