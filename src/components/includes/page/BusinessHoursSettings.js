import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import fetch from 'axios';
import SubmitButton from '../../utils/SubmitButton';
import { connect } from 'react-redux';
import { Alert } from '../../../actions/AlertActions';
import { UncontrolledTooltip } from 'reactstrap';
import { LogError } from '../../utils/LogError';

class BusinessHoursSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            showSettings: false,
            monStartTime: '',
            tueStartTime: '',
            wedStartTime: '',
            thuStartTime: '',
            friStartTime: '',
            satStartTime: '',
            sunStartTime: '',
            monEndTime: '',
            tueEndTime: '',
            wedEndTime: '',
            thuEndTime: '',
            friEndTime: '',
            satEndTime: '',
            sunEndTime: ''
        }
    }

    componentDidMount() {
        fetch.get('/api/get/business_hours')
        .then(resp => {
            if (resp.data.status === 'success') {
                let monStart, monEnd, tueStart, tueEnd, wedStart, wedEnd, thuStart, thuEnd, friStart, friEnd, satStart, satEnd, sunStart, sunEnd;

                for (let day in resp.data.hours) {
                    let hours = resp.data.hours[day].split(' - ');

                    if (hours.length === 2) {
                        if (day === 'monday') {
                            monStart = hours[0];
                            monEnd = hours[1];
                        } else if (day === 'tuesday') {
                            tueStart = hours[0];
                            tueEnd = hours[1];
                        } else if (day === 'wednesday') {
                            wedStart = hours[0];
                            wedEnd = hours[1];
                        } else if (day === 'thursday') {
                            thuStart = hours[0];
                            thuEnd = hours[1];
                        } else if (day === 'friday') {
                            friStart = hours[0];
                            friEnd = hours[1];
                        } else if (day === 'saturday') {
                            satStart = hours[0];
                            satEnd = hours[1];
                        } else if (day === 'sunday') {
                            sunStart = hours[0];
                            sunEnd = hours[1];
                        }
                    }
                }

                this.initialState = {
                    monStartTime: monStart,    
                    tueStartTime: tueStart,
                    wedStartTime: wedStart,
                    thuStartTime: thuStart,
                    friStartTime: friStart,
                    satStartTime: satStart,
                    sunStartTime: sunStart,
                    monEndTime: monEnd,
                    tueEndTime: tueEnd,
                    wedEndTime: wedEnd,
                    thuEndTime: thuEnd,
                    friEndTime: friEnd,
                    satEndTime: satEnd,
                    sunEndTime: sunEnd
                }

                this.setState(this.initialState);
            }
        })
        .catch(err => LogError(err, '/api/get/business_hours'));
    }
    
    save() {
        this.setState({status: 'Loading'});

        let days = {}

        if (this.state.monStartTime && this.state.monEndTime) {
            days['mon'] = this.state.monStartTime + ' - ' + this.state.monEndTime;
        } else {
            days['mon'] = 'Closed';
        }

        if (this.state.tueStartTime && this.state.tueEndTime) {
            days['tue'] = this.state.tueStartTime + ' - ' + this.state.tueEndTime;
        } else {
            days['tue'] = 'Closed';
        }

        if (this.state.wedStartTime && this.state.wedEndTime) {
            days['wed'] = this.state.wedStartTime + ' - ' + this.state.wedEndTime;
        } else {
            days['wed'] = 'Closed';
        }

        if (this.state.thuStartTime && this.state.thuEndTime) {
            days['thu'] = this.state.thuStartTime + ' - ' + this.state.thuEndTime;
        } else {
            days['thu'] = 'Closed';
        }

        if (this.state.friStartTime && this.state.friEndTime) {
            days['fri'] = this.state.friStartTime + ' - ' + this.state.friEndTime;
        } else {
            days['fri'] = 'Closed';
        }

        if (this.state.satStartTime && this.state.satEndTime) {
            days['sat'] = this.state.satStartTime + ' - ' + this.state.satEndTime;
        } else {
            days['sat'] = 'Closed';
        }

        if (this.state.sunStartTime && this.state.sunEndTime) {
            days['sun'] = this.state.sunStartTime + ' - ' + this.state.sunEndTime;
        } else {
            days['sun'] = 'Closed';
        }

        fetch.post('/api/user/business_hours/save', days)
        .then(resp => {
            if (resp.data.status === 'success') {
                let clonedState = Object.assign({}, this.state);

                this.setState(clonedState);

                delete clonedState.status;
                delete clonedState.showSettings;

                this.initialState = clonedState;
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/user/business_hours/save'));
    }
    
    render() {
        let settings;
        let clonedState = Object.assign({}, this.state);
        delete clonedState.status;
        delete clonedState.showSettings;

        if (this.state.showSettings) {
            settings = <div className='bordered-container rounded'>
                <HourSetters day='Monday' startTime={(val) => this.setState({monStartTime: val})} endTime={(val) => this.setState({monEndTime: val})} startValue={this.state.monStartTime} endValue={this.state.monEndTime} />
                <HourSetters day='Tuesday' startTime={(val) => this.setState({tueStartTime: val})} endTime={(val) => this.setState({tueEndTime: val})} startValue={this.state.tueStartTime} endValue={this.state.tueEndTime} />
                <HourSetters day='Wednesday' startTime={(val) => this.setState({wedStartTime: val})} endTime={(val) => this.setState({wedEndTime: val})} startValue={this.state.wedStartTime} endValue={this.state.wedEndTime} />
                <HourSetters day='Thursday' startTime={(val) => this.setState({thuStartTime: val})} endTime={(val) => this.setState({thuEndTime: val})} startValue={this.state.thuStartTime} endValue={this.state.thuEndTime} />
                <HourSetters day='Friday' startTime={(val) => this.setState({friStartTime: val})} endTime={(val) => this.setState({friEndTime: val})} startValue={this.state.friStartTime} endValue={this.state.friEndTime} />
                <HourSetters day='Saturday' startTime={(val) => this.setState({satStartTime: val})} endTime={(val) => this.setState({satEndTime: val})} startValue={this.state.satStartTime} endValue={this.state.satEndTime} />
                <HourSetters day='Sunday' startTime={(val) => this.setState({sunStartTime: val})} endTime={(val) => this.setState({sunEndTime: val})} startValue={this.state.sunStartTime} endValue={this.state.sunEndTime} />

                <div className='text-right'><SubmitButton loading={this.state.status === 'Loading'} type='button' value='Save' onClick={() => this.save()} disabled={JSON.stringify(clonedState) == JSON.stringify(this.initialState)} /></div>
            </div>;
        }

        return (
            <div id='business-hours-settings' className='mb-3'>
                <div className='d-flex-between-center mb-3'>
                    <div className='d-flex-between-center'>
                        <div className='mr-1'>Business Hours:</div>
                        <div id='business-hours-tip'><FontAwesomeIcon icon={faQuestionCircle} /></div>
                        <UncontrolledTooltip placement='right' target='business-hours-tip'>If one or both fields are blank, it will indicate 'Closed' for that day.<br/>Format example - 8:00 AM PST, 12:00 PM, 24:00, etc.</UncontrolledTooltip>
                    </div>
                    
                    
                    <button className='btn btn-info btn-sm' onClick={() => this.setState({showSettings: !this.state.showSettings})}>{this.state.showSettings ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}</button>
                </div>

                {settings}
            </div>
        );
    }
}

const HourSetters = props => {
    return(
        <div className='mb-3'>
            <label>{props.day}</label>
                                    
            <div className='d-flex-between-center'>
                <div className='w-45'><input type='text' className='form-control' onChange={(e) => props.startTime(e.target.value)} maxLength='15' defaultValue={props.startValue} /></div>
                <div className='w-5 text-center'>-</div>
                <div className='w-45'><input type='text' className='form-control' onChange={(e) => props.endTime(e.target.value)} maxLength='15' defaultValue={props.endValue} /></div>
            </div>
        </div>
    )
}

export default connect()(BusinessHoursSettings);