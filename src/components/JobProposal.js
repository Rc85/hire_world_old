import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextArea from './utils/TextArea';
import InputWrapper from './utils/InputWrapper';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { connect } from 'react-redux';
import SubmitButton from './utils/SubmitButton';
import moment from 'moment';
import { IsTyping } from '../actions/ConfigActions';

class JobProposal extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            description: this.props.job && this.props.job.job_description ? this.props.job.job_description : '',
            title: this.props.job && this.props.job.job_title ? this.props.job.job_title : '',
            due_date: this.props.job && this.props.job.job_due_dte ? moment(this.props.job.job_due_date) : null,
            budget: this.props.job && this.props.job.job_budget ? this.props.job.job_budget : '',
            currency: this.props.job && this.props.job.job_price_currency ? this.props.job.job_price_currency : '',
        }
    }
    
    render() {
        console.log(this.props.job)
        return (
            <div id='start-job' className={this.props.className ? this.props.className : ''}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    this.props.submit(this.state);
                }}>
                    <div className='setting-field-container mb-3'>
                        <div className='setting-child'>
                            <InputWrapper label='Work Title' required>
                                <input type='text' value={this.state.title} onChange={(e) => this.setState({title: e.target.value})} placeholder='Title to identify the job' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                            </InputWrapper>
                        </div>
                    </div>

                    <div className='setting-field-container mb-3'>
                        <div className='setting-child'>
                            <InputWrapper label='Budget'>
                                <input type='text' value={this.state.budget} onChange={(e) => this.setState({budget: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                            </InputWrapper>
                        </div>

                        <div className='setting-child'>
                            <InputWrapper label='Currency'>
                                <input type='text' value={this.state.currency} list='job_budget_currency' onChange={(e) => this.setState({currency: e.target.value})} />
                                <datalist id='job_budget_currency'>
                                    <option value='AUD'>AUD</option>
                                    <option value='CAD'>CAD</option>
                                    <option value='EUR'>EUR</option>
                                    <option value='USD'>USD</option>
                                </datalist>
                            </InputWrapper>
                        </div>

                        <div className='setting-child'>
                            <InputWrapper label='Expected Due Date' className='pb-1 pr-1 pl-1'>
                                <DatePicker dropdownMode='select' onChange={(val) => this.setState({due_date: val})} selected={this.state.due_date} value={moment(this.state.due_date).isValid() ? moment(this.state.due_date).format('MM-DD-YYYY') : ''} />
                            </InputWrapper>
                        </div>
                    </div>

                    <div className='mb-3'>
                        <InputWrapper label='Work Description' required>
                            <TextArea value={this.state.description} placeholder={`Describe the work with as detail as possible (expectations, quality, requirements, tasks completed by date, agreements, etc.)`} onChange={(val) => this.setState({description: val})} className='w-100' textAreaClassName='w-100' value={this.state.description} />
                        </InputWrapper>
                    </div>

                    <div className='text-right'>
                        <SubmitButton type='submit' loading={this.props.status === 'Submitting Proposal'} />
                        <button type='button' className='btn btn-secondary' onClick={() => this.props.cancel()}>Cancel</button>
                    </div>
                </form>
            </div>
        );
    }
}

JobProposal.propTypes = {

};

export default connect()(JobProposal);