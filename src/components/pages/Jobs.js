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
        if (prevState.offset !== this.state.offset || prevProps.match.params.stage !== this.props.match.params.stage || prevProps.location.key !== this.props.location.key) {
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

    appealAbandon(val, id, index) {
        this.setState({status: 'Loading'});

        fetch.post('/api/jobs/appeal-abandon', {job_id: id, additional_info: val})
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
        .catch(err => LogError(err, '/api/jobs/appeal-abandon'));
    }

    submitReview(review, message, star, index) {
        this.setState({status: 'Sending'});

        fetch.post('/api/user/review/submit', {review: review, message, star: star})
        .then(resp => {
            console.log(resp);
            let jobs = [...this.state.jobs];
            jobs[index] = resp.data.job;

            this.setState({status: '', jobs: jobs});
            
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/user/review/submit'));
    }
    
    render() {
        let status, body;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        let jobs = this.state.jobs.map((job, i) => {
            let pinned = false;

            if (job.pinned_date) {
                pinned = true;
            }

            return <InquiryRow key={i} user={this.props.user.user} stage={this.props.match.params.stage} message={job} pin={() => this.pinMessage(job.job_id, i)} pinned={pinned} appeal={(info, id) => this.appealAbandon(info, id, i)} submitReview={(review, message, star) => this.submitReview(review, message, star, i)} />
        });

        if (this.state.jobs.length > 0) {
            body = <React.Fragment>
                <Pagination totalItems={parseInt(this.state.jobCount)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: 25 * i})} />

                <hr/>

                {jobs}

                <hr/>

                <Pagination totalItems={parseInt(this.state.jobCount)} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: 25 * i})} />
            </React.Fragment>;
        } else if (this.state.jobs.length === 0) {
            body = <div className='text-center p-5'>
                <h2 className='text-muted'>You don't have any {this.props.match.params.stage.toLowerCase()} jobs.</h2>
            </div>;
        }

        return (
            <section id='jobs' className='blue-panel three-rounded shallow w-100'>
                {status}
                
                {body}
            </section>
        );
    }
}

Jobs.propTypes = {

};

export default withRouter(connect()(Jobs));