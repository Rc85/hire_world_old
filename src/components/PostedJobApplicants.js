import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LogError } from './utils/LogError';
import fetch from 'axios';
import { connect } from 'react-redux';
import ApplicantRow from './ApplicantRow';

class PostedJobApplicants extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            applicants: []
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/posted/job/applicants', {id: this.props.id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', applicants: resp.data.applicants});
            } else if (resp.data.status === 'error') {
                this.setState({status: resp.data.status});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/posted/job/applicants');
            this.setState({status: ''});
        });
    }
    
    render() {
        let applicants;

        if (this.state.status === 'error') {
            applicants = <div className='text-center'><h5>Error loading applicants</h5></div>;
        } else if (this.state.applicants.length === 0) {
            applicants = <div className='text-center'><h5>There are no applicants</h5></div>;
        } else if (this.state.applicants.length > 0) {
            applicants = this.state.applicants.map((applicant, i) => {
                return <React.Fragment key={applicant.application_id}>
                    <ApplicantRow applicant={applicant} reject={(id) => this.reject(id, i)} status={this.state.status} />

                    {i + 1 !== this.state.applicants.length ? <hr /> : ''}
                </React.Fragment>
            });
        }
        
        return (
            <div id='applicants' className='simple-container no-bg'>
                <div className='simple-container-title'>Applicants</div>
                
                <div className='applicant-list'>
                    {applicants}
                </div>
            </div>
        );
    }
}

PostedJobApplicants.propTypes = {

};

export default connect()(PostedJobApplicants);