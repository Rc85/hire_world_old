import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import SubmitButton from '../../utils/SubmitButton';
import MilestoneCreator from './MilestoneCreator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp, faCalendarEdit, faCalendarAlt } from '@fortawesome/pro-solid-svg-icons';
import MilestoneDetailsRow from './MilestoneDetailsRow';

class MilestoneDetails extends Component {
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
            <div className='mb-5'>{this.props.job.job_details}</div>

            <div className='simple-container no-bg mb-3'>
                <div className='simple-container-title'>Milestones</div>
                
                {this.props.milestones.map((milestone, i) => {
                    return <React.Fragment key={milestone.milestone_id}>
                        <MilestoneDetailsRow milestone={milestone} index={i} />

                        {i + 1 !== this.props.milestones.length ? <hr /> : ''}
                    </React.Fragment>;
                })}
            </div>
        </React.Fragment>

        return (
            <div className='simple-container no-bg mb-3'>
                <div className='simple-container-title'>Agreement</div>

                <div className='milestone-agreement-buttons mb-3'>
                    <div><FontAwesomeIcon icon={faCalendarAlt} className='text-special mr-1' /><strong>Milestone Created:</strong> {moment.utc(this.props.job.milestones_created_date).format('MM-DD-YYYY')}</div>

                    <div>
                        {this.props.user.user && this.props.user.user.username === this.props.job.job_user
                            ? this.state.edit 
                                ? <button className='btn btn-secondary' onClick={() => this.setState({edit: false})}>Cancel</button> 
                                : <button className='btn btn-primary' onClick={() => this.setState({edit: true})}>Edit</button>
                            : ''}
                        {this.state.edit ? '' :<button className='btn btn-info' type='button' onClick={() => this.setState({showDetails: !this.state.showDetails})}><FontAwesomeIcon icon={this.state.showDetails ? faCaretUp : faCaretDown} /></button>}
                    </div>
                </div>

                {this.state.edit 
                    ? <MilestoneCreator editing={true} cancel={() => this.setState({edit: false})} job={this.props.job} milestones={this.props.milestones} update={(job, milestones) => this.setState({job: job, milestones: milestones})} update={(job, milestones) => this.props.update(job, milestones)} /> 
                    : this.state.showDetails 
                        ? details
                        : ''
                }

                {this.props.user.user && this.props.user.user.username === this.props.job.job_client ? 
                <div className='text-right'>
                    <SubmitButton type='button' loading={this.props.status === 'Confirming'} value='Confirm' onClick={() => this.props.confirm()} />
                    <button className='btn btn-danger' onClick={() => this.props.decline()}>Decline</button>
                </div>
                : ''}
            </div>
        );
    }
}

MilestoneDetails.propTypes = {
    user: PropTypes.object,
    job: PropTypes.object,
    milestones: PropTypes.array
};

export default MilestoneDetails;