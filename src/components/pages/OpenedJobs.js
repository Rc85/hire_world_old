import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import OpenedJobRow from '../includes/page/OpenedJobRow';

class OpenedJobs extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            jobs: []
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Fetching'});

        fetch.post('/api/jobs/fetch/opened')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', jobs: resp.data.jobs});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/jobs/fetch/opened');
            this.setState({status: ''});
        });
    }
    
    render() {
        let jobs = this.state.jobs.map((job, i) => {
            return <OpenedJobRow job={job} key={i} user={this.props.user} />;
        });

        return (
            <section id='opened-jobs' className='main-panel'>
                <TitledContainer title='Opened Jobs' icon={<FontAwesomeIcon icon={faFolderOpen} />} shadow bgColor='green'>
                    {this.state.status === 'error' ? <span>An error occurred while retrieving the job list</span> : ''}

                    {jobs}
                </TitledContainer>
            </section>
        );
    }
}

OpenedJobs.propTypes = {

};

export default OpenedJobs;