import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'axios';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { LogError } from '../utils/LogError';
import Pagination from '../utils/Pagination';
import InquiryRow from '../includes/page/InquiryRow';
import { Alert } from '../../actions/AlertActions';
import Loading from '../utils/Loading';

class Jobs extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            jobs: [],
            offset: 0
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevState.offset !== this.state.offset || prevProps.match.params.stage !== this.props.match.params.stage) {
            this.setState({status: 'Loading'});

            fetch.post('/api/get/jobs', {stage: this.props.match.params.stage, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', jobs: resp.data.jobs, jobCount: resp.data.jobCount});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                }
            })
            .catch(err => LogError(err, '/api/get/jobs'));
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/jobs', {stage: this.props.match.params.stage, offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', jobs: resp.data.jobs, jobCount: resp.data.jobCount});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/get/jobs'));
    }

    pinMessage(id, index) {
        this.setState({status: 'Loading'});

        fetch.post('/api/job/pin', {id: id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let jobs = [...this.state.jobs];
                jobs[index].pinned_date = resp.data.pinnedDate;

                this.setState({status: '', jobs: jobs});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/job/pin'));
    }

    appealAbandon(val) {
        this.setState({status: 'Loading'});

        fetch.post('/api/jobs/appeal-abandon', {job_id: this.props.message.job_id, additional_info: val})
        .then(resp => {
            this.setState({status: ''});

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/jobs/appeal-abandon'));
    }
    
    render() {
        let status;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        let jobs = this.state.jobs.map((job, i) => {
            let pinned = false;

            if (job.pinned_date) {
                pinned = true;
            }

            return <InquiryRow key={i} user={this.props.user.user} stage={this.props.match.params.stage} message={job} pin={() => this.pinMessage(job.job_id, i)} pinned={pinned} appeal={(info) => this.appealAbandon(info)} />
        });

        return (
            <section id='jobs' className='blue-panel three-rounded shallow w-100'>
                {status}
                {this.state.jobs.length > 0 ? <React.Fragment><Pagination totalItems={parseInt(this.state.jobCount)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: 25 * i})} /><hr/></React.Fragment> : ''}

                {jobs}

                {this.state.jobs.length > 0 ? <React.Fragment><hr/><Pagination totalItems={parseInt(this.state.jobCount)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: 25 * i})} /></React.Fragment> : ''}
            </section>
        );
    }
}

Jobs.propTypes = {

};

export default withRouter(connect()(Jobs));