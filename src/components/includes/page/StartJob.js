import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextArea from '../../utils/TextArea';
import InputWrapper from '../../utils/InputWrapper';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Alert } from '../../../actions/AlertActions';
import { connect } from 'react-redux';
import SubmitButton from '../../utils/SubmitButton';
import fetch from 'axios';
import moment from 'moment';
import { LogError } from '../../utils/LogError';

class StartJob extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            descriptionLength: 10000,
            workDescription: '',
            workTitle: '',
            workDueDate: moment(),
            listingId: this.props.user.listing_id,
            user: this.props.user.username
        }
    }

    /* setOfferPrice(price) {
        let valCheck = /^[0-9]*(\.{1}[0-9]{1,2})?$/;
        if (!price) {
            this.setState({offerPrice: 0});
        } else {
            if (valCheck.test(price)) {
                this.setState({offerPrice: parseFloat(price)});
            }
        }
    }

    setMilestonePrice(index, val) {
        let milestones = [...this.state.milestones];
        let valCheck = /^[0-9]*(\.{1}[0-9]{1,2})?$/;
        let percentCheck = /^([0-9]*\.{1})?[0-9]+%$/;
        let price;

        if (val) {
            if (val.match(percentCheck)) {
                if (typeof this.state.offerPrice === 'number') {
                    let getPercent = val.substr(0, val.length - 1);
                    let percent = parseFloat(getPercent) / 100;

                    price = this.state.offerPrice * percent;

                    let rounded = Math.round(price * 100) / 100;

                    milestones[index].paymentAmount = rounded;

                    this.setState({milestones: milestones});
                }
            } else if (val.match(valCheck)) {
                milestones[index].paymentAmount = parseFloat(val);

                this.setState({milestones: milestones});
            } else if (val.match(/([0-9]*)?\.$/)) {
                milestones[index].paymentAmount = val;

                this.setState({milestones: milestones});
            } else if (!val.match(valCheck)) {
                this.props.dispatch(Alert('error', 'Invalid price'));
            }
        } else {
            milestones[index].paymentAmount = 0;

            this.setState({milestones: milestones});
        }
    }

    addMilestone() {
        let milestones = [...this.state.milestones];

        if (milestones.length < milestonesAllowed) {
            milestones.push({description: '', paymentAmount: '', conditions: [null]});

            this.setState({milestones: milestones});
        } else {
            this.props.dispatch(Alert('error', 'Cannot create more milestones'));
        }
    }

    deleteMilestone(index) {
        let milestones = [...this.state.milestones];

        if (milestones.length > 1) {
            milestones.splice(index, 1);

            this.setState({milestones: milestones});
        } else {
            this.props.dispatch(Alert('error', 'At least one milestone is required'));
        }
    }

    addCondition(index) {
        let milestones = [...this.state.milestones];

        if (milestones[index].conditions.length < conditionsAllowed) {
            milestones[index].conditions.push(null);

            this.setState({milestones: milestones});
        } else {
            this.props.dispatch(Alert('error', 'Cannot create more conditions'));
        }
    }

    deleteCondition(mIndex, cIndex) {
        let milestones = [...this.state.milestones];

        if (milestones[mIndex].conditions.length > 1) {
            milestones[mIndex].conditions.splice(cIndex, 1);

            this.setState({milestones: milestones});
        } else {
            this.props.dispatch(Alert('error', 'A milestone needs at least one condition'));
        }
    }

    setCondition(mIndex, cIndex, val) {
        let milestones = [...this.state.milestones];

        milestones[mIndex].conditions[cIndex] = val;

        this.setState({milestones: milestones});
    }

    setDueDate(index, date) {
        let milestones = [...this.state.milestones];

        milestones[index].dueDate = date;

        this.setState({milestones: milestones});
    }
 */
    submit() {
        this.setState({status: 'Submitting'});

        fetch.post('/api/job/create', this.state)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', workDescription: '', workTitle: '', workDueDate: moment()});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/job/create');
            this.setState({status: ''});
        });
    }
    
    render() {
        /* let milestones = this.state.milestones.map((m, i) => {
            return <div key={i} className='simple-container mb-3'>
                <div className='simple-container-title'>Milestone #{i + 1}</div>

                {this.state.milestones.length > 1 ? <button type='button' className='btn btn-danger delete-milestone-button' onClick={() => this.deleteMilestone(i)}><FontAwesomeIcon icon={faTimes} /></button> : ''}

                <span className='text-black'>Enter a percentage (eg. - 25%) to calculate percent of total offer price</span>

                <InputWrapper label='Payment Amount' required className='mb-3'>
                    <input type='text' onChange={(e) => this.setMilestonePrice(i, e.target.value)} value={m.paymentAmount} value={this.state.milestones[i].paymentAmount} />
                </InputWrapper>

                {m.conditions.map((c, index) => {
                    return <div key={index} className='condition-container mb-1'>
                        <InputWrapper label={`Condition #${index + 1}`} required>
                            <input type='text' onChange={(e) => this.setCondition(i, index, e.target.value)} value={this.state.milestones[i].conditions[index] === null ? '' : this.state.milestones[i].conditions[index]} />
                        </InputWrapper>

                        {this.state.milestones[i].conditions.length > 1 ? <button type='button' className='btn btn-secondary mt-2 ml-1' onClick={() => this.deleteCondition(i, index)}><FontAwesomeIcon icon={faTrash} /></button> : ''}
                    </div>;
                })}

                <div className='text-right mb-3'>
                    <button type='button' className='btn btn-primary btn-sm' onClick={() => this.addCondition(i)}><FontAwesomeIcon icon={faPlus} /> Add Condition</button>
                </div>

                <InputWrapper label='Due Date' className='mb-3'>
                    <DatePicker dropdownMode='select' onChange={(val) => this.setDueDate(i, val)} selected={this.state.milestones[i].dueDate} />
                </InputWrapper>
            </div>;
        }); */

        return (
            <div id='start-job' className={this.props.className ? this.props.className : ''}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    this.submit();
                }}>
                    <div className='setting-field-container mb-3'>
                        <InputWrapper label='Work Title' required>
                            <input type='text' value={this.state.workTitle} onChange={(e) => this.setState({workTitle: e.target.value})} placeholder='Title to identify the job' />
                        </InputWrapper>

                        <InputWrapper label='Expected Due Date' className='pb-1 pr-1 pl-1'>
                            <DatePicker dropdownMode='select' onChange={(val) => this.setState({workDueDate: val})} selected={this.state.workDueDate} />
                        </InputWrapper>
                    </div>

                    <div className='mb-3'>
                        <InputWrapper label='Work Description' required>
                            <TextArea value={this.state.workDescription} placeholder={`Describe the work as detail as possible`} onChange={(val) => this.setState({workDescription: val})} className='w-100' textAreaClassName='w-100' />
                        </InputWrapper>

                        <div className='character-count'>{this.state.workDescription.length} / {this.state.descriptionLength}</div>
                    </div>

                    <div className='text-right'>
                        <SubmitButton type='submit' loading={this.state.status === 'Submitting'} />
                        <button type='button' className='btn btn-secondary' onClick={() => this.props.cancel()}>Cancel</button>
                    </div>
                </form>
            </div>
        );
    }
}

StartJob.propTypes = {

};

export default connect()(StartJob);