import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePlus } from '@fortawesome/pro-solid-svg-icons';
import { connect } from 'react-redux';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import { Alert } from '../../actions/AlertActions';
import Recaptcha from 'react-recaptcha';
import PostJobForm from '../includes/page/PostJobForm';
import SubmitButton from '../utils/SubmitButton';
import moment from 'moment';
import Loading from '../utils/Loading';

let recaptchaInstance;
const onloadCallback = () => {
    console.log('Recaptcha ready!');
}

class PostJob extends Component {
    constructor(props) {
        super(props);

        this.initialState = {
            status: '',
            title: '',
            sector: 'Agencies',
            budgetThreshold: '',
            budget: null,
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
            notification: false,
            positions: '1',
            paymentType: '',
            budgetEnd: null,
            type: '',
            expire: moment().add(1, 'month')
        }
        
        this.state = {
            status: '',
            title: '',
            sector: 'Agencies',
            budgetThreshold: '',
            budget: null,
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
            notification: false,
            positions: '1',
            paymentType: '',
            budgetEnd: null,
            type: '',
            expire: moment().add(1, 'month')
        }
    }

    submit() {
        this.setState({status: 'Submitting'});

        fetch.post('/api/post/job', this.state)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState(this.initialState);
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            recaptchaInstance.reset();
        })
        .catch(err => {
            LogError(err, '/api/post/job');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
            recaptchaInstance.reset();
        })
    }

    verify(val) {
        this.state.verified = val;
    }

    set(key, val) {
        let obj = {};
        obj[key] = val;

        this.setState(obj);
    }
    
    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        }

        if (this.props.user.user) {
            return (
                <section id='#post-job' className='main-panel'>
                    <TitledContainer title='Post a Job' bgColor='lime' icon={<FontAwesomeIcon icon={faFilePlus} />} shadow>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            this.submit();
                        }}>
                            <PostJobForm submit={() => this.submit()} set={(key, val) => this.set(key, val)} data={this.state} sectors={this.props.sectors} />

                            <div className='setting-field-container'>
                                <div className='setting-child'><Recaptcha sitekey='6Le5uJ4UAAAAAMvk94nwQjc9_8nln2URksn1152W' render='explicit' onloadCallback={onloadCallback} verifyCallback={(val) => this.verify(val)} ref={(el) => recaptchaInstance = el} /></div>

                                <div className='setting-child text-right'>
                                    <SubmitButton type='submit' loading={this.state.status === 'Submitting'} />
                                    <button className='btn btn-secondary' type='button' onClick={() => this.setState(this.initialState)}>Clear</button>
                                </div>
                            </div>
                        </form>
                    </TitledContainer>
                </section>
            );
        }

        return <Loading size='7x' color='black' />
    }
}

PostJob.propTypes = {

};

export default connect()(PostJob);