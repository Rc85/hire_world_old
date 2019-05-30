import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyCheckAlt } from '@fortawesome/pro-solid-svg-icons';
import { faCalendarExclamation, faBullseye, faCaretUp, faCaretDown } from '@fortawesome/pro-solid-svg-icons';
import moment from 'moment';
import MoneyFormatter from './utils/MoneyFormatter';

class MilestoneDetailsRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            show: true
        }
    }
    
    render() {
        return (
            <div className='milestone-detail-container'>
                <div className='milestone-detail-header'>
                    <div className='milestone-number mb-3'>{this.props.index + 1}</div>

                    <div className='mb-1'><FontAwesomeIcon icon={faMoneyCheckAlt} className='text-special mr-1' /> <strong>Payment:</strong> $<MoneyFormatter value={this.props.milestone.milestone_payment_amount} /></div>
                    <div className='mb-1'><FontAwesomeIcon icon={faCalendarExclamation} className='text-special mr-1' /> <strong>Expected Delivery Date:</strong> {this.props.milestone.milestone_due_date ? <React.Fragment><br />{moment(this.props.milestone.milestone_due_date).format('MM-DD-YYYY')}</React.Fragment> : 'N/A'}</div>
                </div>

                <div className='milestone-condition-container'>
                    <div className='d-flex-between-start mb-3'>
                        <div><FontAwesomeIcon icon={faBullseye} className='text-special mr-1' /> <strong>Conditions</strong></div>
                    </div>

                    <div className={`condition-row-container ${this.state.show ? 'expand' : ''}`}>
                        {this.props.milestone.conditions.length > 0 && this.props.milestone.conditions.map((condition, i) => {
                            return <div key={condition.condition_id} className='milestone-detail-condition-row'>
                                <div className='mr-2'><strong>{i + 1}.</strong></div> <div>{condition.condition}</div>
                            </div>
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

MilestoneDetailsRow.propTypes = {

};

export default MilestoneDetailsRow;