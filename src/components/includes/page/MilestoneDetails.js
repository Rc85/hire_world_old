import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import SubmitButton from '../../utils/SubmitButton';
import MilestoneCreator from './MilestoneCreator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

class EstimateDetails extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            edit: false,
            showDetails: true
        }
    }
    
    render() {
        let details = <React.Fragment>
            <div className='d-flex-between-center'>
                <span><strong>Total Payment:</strong> ${this.props.job.job_total_price} {this.props.job.job_price_currency}</span>
                <button className='btn btn-info' type='button' onClick={() => this.setState({showDetails: !this.state.showDetails})}><FontAwesomeIcon icon={this.state.showDetails ? faCaretUp : faCaretDown} /></button>
            </div>

            <hr/>

            {this.state.showDetails ? this.props.milestones.map((milestone, i) => {
                return <div key={milestone.milestone_id} className='milestone-detail-container mb-3'>
                    <div className='milestone-details'>
                        <div className='milestone-detail'><h5>Milestone {i + 1}</h5></div>

                        <div className='milestone-detail'>
                            <nobr><strong>Payment:</strong></nobr>
                            <div>${milestone.milestone_payment_amount} {this.props.job.job_price_currency}</div>
                        </div>

                        <div className='milestone-detail'>
                            <nobr><strong>Expected Delivery Date:</strong></nobr>
                            <div>{milestone.milestone_due_date ? moment(milestone.milestone_due_date).format('MM-DD-YYYY') : 'None'}</div>
                        </div>
                    </div>

                    <div className='milestone-condition-container'>
                        <div className='condition-row'><h6>Conditions</h6></div>
                        
                        {milestone.conditions.map((condition, index) => {
                            return <div key={condition.condition_id} className='condition-row'>
                                <div className='condition-number'><strong>{index + 1}.</strong></div>
                                <div className='condition-detail'>{condition.condition}</div>
                            </div>
                        })}
                    </div>
                </div>
            }) : ''}
        </React.Fragment>

        return (
            <div className='simple-container no-bg mb-3'>
                <div className='simple-container-title'>Details</div>

                {this.state.edit ? <MilestoneCreator editing={true} cancel={() => this.setState({edit: false})} job={this.props.job} milestones={this.props.milestones} /> : details}

                {this.props.user.user && this.props.user.user.username === this.props.job.job_client ? 
                <div className='text-right'>
                    <SubmitButton type='button' loading={this.props.status === 'Confirming'} value='Confirm' onClick={() => this.props.confirm()} />
                    <button className='btn btn-danger' onClick={() => this.props.decline()}>Decline</button>
                </div>
                : this.state.edit ? '' : <div className='text-right'><button className='btn btn-primary' onClick={() => this.setState({edit: true})}>Edit</button></div>}
            </div>
        );
    }
}

EstimateDetails.propTypes = {
    user: PropTypes.object,
    job: PropTypes.object,
    milestones: PropTypes.array
};

export default EstimateDetails;