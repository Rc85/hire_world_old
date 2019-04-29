import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LogError } from '../../utils/LogError';
import Loading from '../../utils/Loading';
import fetch from 'axios';
import TitledContainer from '../../utils/TitledContainer';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/pro-solid-svg-icons';
import Username from './Username';

class ViewUserWorkHistory extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            history: [],
            offset: 0,
            totalJobs: 0
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.offset !== this.state.offset) {
            fetch.post('/api/get/user/work', {user: this.props.match.params.username, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let history = [...this.state.history, ...resp.data.history];

                    this.setState({status: '', history: history});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                }
            })
            .catch(err => {
                LogError(err, '/api/get/user/work');
                this.setState({status: ''});
            })
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/user/work', {user: this.props.match.params.username, offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', history: resp.data.history, totalJobs: resp.data.total});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/user/work');
            this.setState({status: ''});
        })
    }
    
    render() {
        if (this.state.status === 'Loading') {
            return <Loading size='5x' />;
        }

        if (this.state.history.length === 0) {
            return null;
        }

        return (
            <TitledContainer title='Recent Jobs' shadow mini className='mt-5'>
                {this.state.status === 'error'
                    ? <div className='text-center mb-3'>Error retrieving user's work history</div>
                    : <div className='mb-3'>
                        {this.state.history.map((job, i) => {
                            let div;

                            if (job.job_status === 'Complete') {
                                div = <div className='work-history'>
                                    <div className='mr-2'><FontAwesomeIcon icon={faCheck} className='text-success' /></div>
                                    <span>Completed a job with <Username username={job.job_client} color='alt-highlight' /> on {moment(job.job_end_date).format('MM-DD-YYYY')}</span>
                                </div>;
                            } else if (job.job_status === 'Abandoned') {
                                div = <div className='work-history'>
                                    <div className='mr-2'><FontAwesomeIcon icon={faTimes} className='text-danger' /></div>
                                    <span>Abandoned a job on {moment(job.job_end_date).format('MM-DD-YYYY')}</span>
                                </div>;
                            }

                            return <div key={job.job_id} className='work-history-row'>
                                {div}
                                {i + 1 !== this.state.history.length ? <hr className='mt-1 mb-1 bg-dark' /> : ''}
                            </div>
                        })}
                    </div>
                }
                {this.state.total > 5 && this.state.total !== this.state.history.length ? <button className='btn btn-primary btn-sm'>Load more</button> : ''}
            </TitledContainer>
        );
    }
}

ViewUserWorkHistory.propTypes = {

};

export default withRouter(ViewUserWorkHistory);