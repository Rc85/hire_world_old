import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputWrapper from './utils/InputWrapper';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TextArea from './utils/TextArea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash, faPlus, faArrowsAlt } from '@fortawesome/pro-solid-svg-icons';
import { Alert } from '../actions/AlertActions';
import { connect } from 'react-redux';
import { faQuestionCircle } from '@fortawesome/pro-regular-svg-icons';
import Tooltip from './utils/Tooltip';
import SubmitButton from './utils/SubmitButton';
import { LogError } from './utils/LogError';
import fetch from 'axios';
import MoneyFormatter from './utils/MoneyFormatter';

class MilestoneCreator extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            jobId: this.props.job.job_id,
            totalPrice: this.props.job ? this.props.job.job_total_price : '',
            currency: this.props.job ? this.props.job.job_price_currency : null,
            milestones: this.props.milestones || [
                {milestone_id: Date.now(), milestone_payment_amount: 0, milestone_due_date: null, conditions: []}
            ],
            details: this.props.job.job_details || ''
        };
    }

    submit() {
        this.setState({status: 'Submitting'});

        let data = {...this.state}
        data['job_modified_date'] = this.props.job.job_modified_date;

        if (this.props.editing) {
            data['edit'] = true;
        }

        fetch.post('/api/job/agreement/submit', data)
        .then(resp => {
            console.log(resp);
            if (resp.data.status === 'success') {
                if (this.props.editing) {
                    this.props.cancel();
                }

                for (let milestone of resp.data.milestones) {
                    if (!milestone.conditions) {
                        milestone.conditions = [];
                    }
                }

                console.log(resp.data.milestones);

                this.props.update(resp.data.job, resp.data.milestones);
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
            milestones.push({milestone_id: Date.now(), milestone_payment_amount: '0', milestone_due_date: null, conditions: []});
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
        let milestones = [...this.state.milestones];
        milestones[mIndex].conditions.splice(cIndex, 1);
        this.setState({milestones: milestones});
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

        let remainingFunds = totalPrice - totalMilestonePayment;

        let milestones = this.state.milestones.map((milestone, i) => {
            return <div key={milestone.milestone_id} className='simple-container'>
                <div className='simple-container-title'>Milestone #{i + 1}</div>

                {this.state.milestones.length > 1 ? <div className='delete-button'><FontAwesomeIcon icon={faTimes} size='lg' onClick={() => this.deleteMilestone(i)} /></div> : ''}

                <div className='funds-remaining mb-3'>Remaining: $<MoneyFormatter value={remainingFunds} /></div>

                <div className='setting-field-container mb-3'>
                    <InputWrapper label='Payment' required>
                        <input type='text' onChange={(e) => this.setPayment(e.target.value, i)} value={milestone.milestone_payment_amount} />
                    </InputWrapper>
    
                    <InputWrapper label='Expected Date' className='pb-1 pr-1 pl-1'>
                        <DatePicker dropdownMode='select' onChange={(val) => this.setDeliveryDate(val, i)} selected={moment(milestone.milestone_due_date).isValid() ? moment(milestone.milestone_due_date) : null} />
                        {milestone.milestone_due_date ? <div><button className='btn btn-danger btn-sm ml-1' type='button' onClick={() => this.unsetDeliveryDate(i)}><FontAwesomeIcon icon={faTimes} /></button></div> : ''}
                    </InputWrapper>
                </div>

                <div className='mb-3'>
                    {milestone.conditions.map((condition, index) => {
                        return <div key={condition.condition_id} className='condition-container'>
                            <InputWrapper label={`Condition #${index + 1}`} required>
                                <input type='text' onChange={(e) => this.setCondition(e.target.value, index, i)} value={condition.condition === null ? '' : condition.condition} />
                            </InputWrapper>
                            <div className='add-condition-buttons'>
                                <button className='condition-button btn btn-danger' type='button' onClick={() => this.deleteCondition(i, index)}><FontAwesomeIcon icon={faTrash} /></button>
                            </div>
                        </div>
                    })}
                </div>

                <div className='text-right mb-3'><button className='btn btn-primary' type='button' onClick={() => this.addCondition(i)}>Add Condition</button></div>
            </div>
        });

        return (
            <div id='estimate-creator mb-3'>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    this.submit();
                }}>
                    <div className='setting-field-container mb-3'>
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

                    <TextArea value={this.state.details} placeholder={`Add any other details such as specific agreements, terms, deadlines, etc. to protect yourself should any issue arise`} onChange={(val) => this.setState({details: val})} className='w-100 mb-3' textAreaClassName='w-100' value={this.state.details} label='Details' />

                    <div className='milestone-creator-details'>
                        <div>
                            <ul>
                                <li>At least one milestone is required</li>
                                <li>At least one condition is needed for each milestone</li>
                                <li>Set milestones that you feel confident you can complete within 90 days, as funds cannot be held for longer than that</li>
                                <li>Be as detail as possible when setting conditions as conditions determine the tasks to be completed</li>
                                <li>Expected date will be entered into your upcoming events</li>
                                <li>Milestone and conditions can be modified at any time upon agreement from both parties as long as the milestone is not complete</li>
                            </ul>
                        </div>
                    </div>

                    <div className='milestone-container mb-3'>
                        {milestones}
                    </div>

                    <div className='mb-3'><button type='button' className='btn btn-primary mr-2' onClick={() => this.addMilestone()}>Add Milestone</button></div>

                    <div className='text-right'>
                        <SubmitButton type='submit' loading={this.state.status === 'Submitting'} value={this.props.editing ? 'Save' : 'Submit'} />
                        <button className='btn btn-secondary' type='button' onClick={() => this.props.cancel()}>Cancel</button>
                    </div>
                </form>
            </div>
        );
    }
}

MilestoneCreator.propTypes = {

};

export default connect()(MilestoneCreator);