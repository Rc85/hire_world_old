import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/pro-solid-svg-icons';
import { faFileSpreadsheet } from '@fortawesome/pro-solid-svg-icons';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import JobRow from '../includes/page/JobRow';
import { Redirect, withRouter } from 'react-router-dom';
import Loading from '../utils/Loading';
import Pagination from '../utils/Pagination';

class Jobs extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            jobs: [],
            offset: 0,
            totalJobs: 0
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.key !== this.props.location.key || prevState.offset !== this.state.offset) {
            this.setState({status: 'Fetching'});

            fetch.post('/api/jobs/fetch', {stage: this.props.match.params.stage, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', jobs: resp.data.jobs});
                } else if (resp.data.status === 'error') {
                    this.setState({status: 'error'});
                }
            })
            .catch(err => {
                LogError(err, '/api/jobs/fetch');
                this.setState({status: ''});
            });
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Fetching'});
        
        fetch.post('/api/jobs/fetch', {stage: this.props.match.params.stage, offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', jobs: resp.data.jobs, totalJobs: resp.data.totalJobs});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/jobs/fetch');
            this.setState({status: ''});
        });
    }

    selectPage() {
        this.setState({offset: this.state.offset + 25})
    }
    
    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        }

        if (this.props.user.user) {
            let jobs = this.state.jobs.map((job, i) => {
                return <JobRow job={job} key={job.job_id} stage={this.props.match.params.stage} user={this.props.user} />;
            });

            return (
                <section id='opened-jobs' className='main-panel'>
                    <TitledContainer title='Proposals' icon={<FontAwesomeIcon icon={faFileSpreadsheet} />} shadow bgColor='green'>
                        {this.state.status === 'error' ? <span>An error occurred while retrieving the job list</span> : ''}

                        <div className='mb-3'><Pagination totalItems={parseInt(this.state.totalJobs)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} /></div>

                        {jobs}

                        <Pagination totalItems={parseInt(this.state.totalJobs)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} />
                    </TitledContainer>
                </section>
            );
        }

        return <Loading size='7x' color='black' />;
    }
}

Jobs.propTypes = {

};

export default withRouter(Jobs);