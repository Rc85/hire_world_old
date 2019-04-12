import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputWrapper from '../../utils/InputWrapper';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import TextArea from '../../utils/TextArea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Alert } from '../../../actions/AlertActions';
import { connect } from 'react-redux';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import Tooltip from '../../utils/Tooltip';
import SubmitButton from '../../utils/SubmitButton';
import { LogError } from '../../utils/LogError';
import fetch from 'axios';
import { NavLink } from 'react-router-dom';

let resetButton;

class MilestoneCreator extends Component {
    constructor(props) {
        super(props);

        this.initialState = {
            status: '',
            jobId: this.props.jobId || this.props.job.job_id,
            totalPrice: this.props.job ? this.props.job.job_total_price : '',
            currency: this.props.job ? this.props.job.job_price_currency : null,
            milestones: this.props.milestones || [
                {milestone_id: Date.now(), milestone_payment_amount: 0, milestone_due_date: null, conditions: [
                    {condition_id: Date.now(), condition: null}
                ]}
            ]
        }
        
        this.state = {
            status: '',
            jobId: this.props.jobId || this.props.job.job_id,
            totalPrice: this.props.job ? this.props.job.job_total_price : '',
            currency: this.props.job ? this.props.job.job_price_currency : null,
            milestones: this.props.milestones || [
                {milestone_id: Date.now(), milestone_payment_amount: 0, milestone_due_date: null, conditions: [
                    {condition_id: Date.now(), condition: null}
                ]}
            ]
        };
    }

    submit() {
        this.setState({status: 'Submitting'});

        let data = {...this.state}
        data['job_modified_date'] = this.props.jobModifiedDate;

        if (this.props.editing) {
            data['edit'] = true;
        }

        fetch.post('/api/job/agreement/submit', data)
        .then(resp => {
            if (resp.data.status === 'success') {
                resetButton.click();

                if (this.props.editing) {
                    this.props.cancel();
                }
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/job/agreement/submit');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    setPayment(val, index) {
        let milestones = [...this.state.milestones];
        milestones[index].milestone_payment_amount = val;
        this.setState({milestones: milestones});
    }

    setDeliveryDate(val, index) {
        let milestones = [...this.state.milestones];
        milestones[index].milestone_due_date = val;
        this.setState({milestones: milestones});
    }

    addMilestone() {
        if (this.state.milestones.length < 20) {
            let milestones = [...this.state.milestones];
            milestones.push({milestone_id: Date.now(), milestone_payment_amount: '0', milestone_due_date: null, conditions: [
                {condition_id: Date.now(), condition: null}
            ]});
            this.setState({milestones: milestones});
        } else {
            this.props.dispatch(Alert('error', 'Cannot add more milestones'));
        }
    }

    deleteMilestone(index) {
        let milestones = [...this.state.milestones];
        milestones.splice(index, 1);
        this.setState({milestones: milestones});
    }

    setCondition(val, cIndex, mIndex) {
        let milestones = [...this.state.milestones];
        milestones[mIndex].conditions[cIndex].condition = val;
        this.setState({milestones: milestones});
    }

    addCondition(index) {
        if (this.state.milestones[index].conditions.length < 10) {
            let milestones = [...this.state.milestones];
            milestones[index].conditions.push({condition_id: Date.now(), condition: null});
            this.setState({milestones: milestones});
        } else {
            this.props.dispatch(Alert('error', 'Cannot add more conditions'));
        }
    }

    deleteCondition(mIndex, cIndex) {
        if (this.state.milestones[mIndex].conditions.length > 1) {
            let milestones = [...this.state.milestones];
            milestones[mIndex].conditions.splice(cIndex, 1);
            this.setState({milestones: milestones});
        } else {
            this.props.dispatch(Alert('error', 'Must have at least ONE condition'));
        }
    }

    unsetDeliveryDate(index) {
        let milestones = [...this.state.milestones];
        milestones[index].milestone_due_date = null;
        this.setState({milestones: milestones});
    }
    
    render() {
        let totalPrice = this.state.totalPrice ? parseFloat(this.state.totalPrice) : 0;
        let totalMilestonePayment = this.state.milestones.reduce((sum, val) => {
            return parseFloat(sum) + parseFloat(val.milestone_payment_amount);
        }, 0);
        console.log(totalMilestonePayment)

        let remainingFunds = totalPrice - totalMilestonePayment;

        let milestones = this.state.milestones.map((milestone, i) => {
            return <div key={milestone.milestone_id} className='simple-container'>
                <div className='simple-container-title'>Milestone #{i + 1}</div>

                {this.state.milestones.length > 1 ? <div className='delete-button'><FontAwesomeIcon icon={faTimes} size='lg' onClick={() => this.deleteMilestone(i)} /></div> : ''}

                <div className='setting-field-container mb-3'>
                    <InputWrapper label='Payment' required>
                        <input type='text' onChange={(e) => this.setPayment(e.target.value, i)} value={milestone.milestone_payment_amount} placeholder='Max $500' />
                    </InputWrapper>
    
                    <InputWrapper label='Expected Date'>
                        <DatePicker dropdownMode='select' onChange={(val) => this.setDeliveryDate(val, i)} selected={moment(milestone.milestone_due_date).isValid() ? moment(milestone.milestone_due_date) : null} />
                        {milestone.milestone_due_date ? <div className='pb-1 pr-1'><button className='btn btn-danger ml-1' type='button' onClick={() => this.unsetDeliveryDate(i)}><FontAwesomeIcon icon={faTimes} /></button></div> : ''}
                    </InputWrapper>
                </div>

                <div className='mb-3'>
                    {milestone.conditions.map((condition, index) => {
                        return <div key={condition.condition_id} className='condition-container'>
                            <InputWrapper label={`Condition #${index + 1}`} className='input-container' required={index === 0}>
                                <input type='text' onChange={(e) => this.setCondition(e.target.value, index, i)} value={condition.condition === null ? '' : condition.condition} />
                            </InputWrapper>
                            {milestone.conditions.length > 1 ? <button className='delete-button btn btn-danger' type='button' onClick={() => this.deleteCondition(i, index)}><FontAwesomeIcon icon={faTrash} /></button> : ''}
                        </div>
                    })}
                </div>

                <div className='text-right mb-3'><button className='btn btn-primary' type='button' onClick={() => this.addCondition(i)}>Add Condition</button></div>
            </div>
        });

        return (
            <div id='estimate-creator'>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    this.submit();
                }}>
                    <div className='setting-field-container mb-3'>
                        <div className='setting-child'>
                            <InputWrapper label='Total Price' required>
                                <input type='text' onChange={(e) => this.setState({totalPrice: e.target.value})} required value={this.state.totalPrice === null ? '' : this.state.totalPrice} />
                            </InputWrapper>
                        </div>

                        <div className='setting-child'>
                            <InputWrapper label='Currency' required>
                                <input type='text' list='price_currency' onChange={(e) => this.setState({currency: e.target.value})} required value={this.state.currency === null ? '' : this.state.currency} />
                                <datalist id='price_currency'>
                                    <option value='AUD'>AUD</option>
                                    <option value='CAD'>CAD</option>
                                    <option value='EUR'>EUR</option>
                                    <option value='USD'>USD</option>
                                </datalist>
                            </InputWrapper>
                        </div>
                    </div>

                    <div className='d-flex-between-center'>
                        <div className='d-flex-center'>
                            <button type='button' className='btn btn-primary mr-2' onClick={() => this.addMilestone()}>Add Milestone</button>
                            <Tooltip placement='right-bottom' text={<span>Notes:
                                <ul>
                                    <li>At least one milestone is required.</li>
                                    <li>At least one condition is needed for each milestone.</li>
                                    <li>Delivery dates should need exceed 90 days.</li>
                                    <li>Be as detail as possible when setting conditions.</li>
                                </ul>
                            </span>}><FontAwesomeIcon icon={faQuestionCircle} size='lg' /></Tooltip>
                        </div>

                        <div className='funds-remaining'>Remaining: ${remainingFunds}</div>
                    </div>

                    <div className='milestone-container mb-3'>
                        {milestones}
                    </div>

                    <div className='text-right'>
                        <SubmitButton type='submit' loading={this.state.status === 'Submitting'} value={this.props.editing ? 'Save' : 'Submit'} />
                        <button className='btn btn-secondary' type='reset' onClick={() => this.setState(this.initialState)} ref={e => resetButton = e}>Reset</button>
                        {this.props.editing ? <button className='btn btn-secondary' type='button' onClick={() => this.props.cancel()}>Cancel</button> : ''}
                    </div>
                </form>
            </div>
        );
    }
}

MilestoneCreator.propTypes = {

};

export default connect()(MilestoneCreator);