import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'axios';
import SubmitButton from '../../utils/SubmitButton';
import { connect } from 'react-redux';
import { Alert } from '../../../actions/AlertActions';
import { LogError } from '../../utils/LogError';
import SlideToggle from '../../utils/SlideToggle';
import { UpdateUser } from '../../../actions/LoginActions';
import TitledContainer from '../../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBusinessTime } from '@fortawesome/free-solid-svg-icons';

class BusinessHoursSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
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
                this.initialState = this.splitHours(resp.data.hours);

                this.setState(this.initialState);
            }
        })
        .catch(err => LogError(err, '/api/get/business_hours'));
    }

    splitHours(days) {
        let monStart, monEnd, tueStart, tueEnd, wedStart, wedEnd, thuStart, thuEnd, friStart, friEnd, satStart, satEnd, sunStart, sunEnd;

        for (let day in days) {
            let hours = days[day].split(' - ');

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

        let initialState = {
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

        return initialState;
    }
    
    save(state) {
        this.setState({status: 'Loading'});

        let days = {}

        if (state.monStartTime && state.monEndTime) {
            days['mon'] = state.monStartTime + ' - ' + state.monEndTime;
        } else {
            days['mon'] = 'Closed';
        }

        if (state.tueStartTime && state.tueEndTime) {
            days['tue'] = state.tueStartTime + ' - ' + state.tueEndTime;
        } else {
            days['tue'] = 'Closed';
        }

        if (state.wedStartTime && state.wedEndTime) {
            days['wed'] = state.wedStartTime + ' - ' + state.wedEndTime;
        } else {
            days['wed'] = 'Closed';
        }

        if (state.thuStartTime && state.thuEndTime) {
            days['thu'] = state.thuStartTime + ' - ' + state.thuEndTime;
        } else {
            days['thu'] = 'Closed';
        }

        if (state.friStartTime && state.friEndTime) {
            days['fri'] = state.friStartTime + ' - ' + state.friEndTime;
        } else {
            days['fri'] = 'Closed';
        }

        if (state.satStartTime && state.satEndTime) {
            days['sat'] = state.satStartTime + ' - ' + state.satEndTime;
        } else {
            days['sat'] = 'Closed';
        }

        if (state.sunStartTime && state.sunEndTime) {
            days['sun'] = state.sunStartTime + ' - ' + state.sunEndTime;
        } else {
            days['sun'] = 'Closed';
        }

        fetch.post('/api/user/business_hours/save', days)
        .then(resp => {
            if (resp.data.status === 'success') {
                let clonedState = Object.assign({}, state);

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

    toggle() {
        this.setState({status: 'Loading'});

        let data = {...this.props.user.user};
        data['display_business_hours'] = !data['display_business_hours'];

        fetch.post(`/api/user/settings/change`, data)
        .then(resp => {
            this.setState({status: ''});

            if (resp.data.status === 'success') {
                this.props.dispatch(UpdateUser(resp.data.user));
            } else {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/user/settings/change'));
    }
    
    render() {
        let clonedState = Object.assign({}, this.state);
        delete clonedState.status;
        delete clonedState.showSettings;

        return (
            <TitledContainer title='Business Hours' bgColor='orange' shadow icon={<FontAwesomeIcon icon={faBusinessTime} />} >
                <section id='business-hours-settings'>
                    <div className='d-flex-between-center'>
                        <div className='mr-1'><h5>Business Hours:</h5></div>
    
                        <SlideToggle status={this.props.user.user.display_business_hours} onClick={() => this.toggle()} />
                    </div>
    
                    <span>If one or both fields are blank, it will indicate 'Closed' for that day.</span>
    
                    <hr/>
    
                    <div id='hours-settings'>
                        <HourSetters day='Monday' startTime={(val) => this.setState({monStartTime: val})} endTime={(val) => this.setState({monEndTime: val})} startValue={this.state.monStartTime} endValue={this.state.monEndTime} />
                        <HourSetters day='Tuesday' startTime={(val) => this.setState({tueStartTime: val})} endTime={(val) => this.setState({tueEndTime: val})} startValue={this.state.tueStartTime} endValue={this.state.tueEndTime} />
                        <HourSetters day='Wednesday' startTime={(val) => this.setState({wedStartTime: val})} endTime={(val) => this.setState({wedEndTime: val})} startValue={this.state.wedStartTime} endValue={this.state.wedEndTime} />
                        <HourSetters day='Thursday' startTime={(val) => this.setState({thuStartTime: val})} endTime={(val) => this.setState({thuEndTime: val})} startValue={this.state.thuStartTime} endValue={this.state.thuEndTime} />
                        <HourSetters day='Friday' startTime={(val) => this.setState({friStartTime: val})} endTime={(val) => this.setState({friEndTime: val})} startValue={this.state.friStartTime} endValue={this.state.friEndTime} />
                        <HourSetters day='Saturday' startTime={(val) => this.setState({satStartTime: val})} endTime={(val) => this.setState({satEndTime: val})} startValue={this.state.satStartTime} endValue={this.state.satEndTime} />
                        <HourSetters day='Sunday' startTime={(val) => this.setState({sunStartTime: val})} endTime={(val) => this.setState({sunEndTime: val})} startValue={this.state.sunStartTime} endValue={this.state.sunEndTime} />
    
                        <div className='text-right'><SubmitButton loading={this.state.status === 'Loading'} type='button' value='Save' onClick={() => this.save(this.state)} disabled={JSON.stringify(clonedState) == JSON.stringify(this.initialState)} /></div>
                    </div>
                </section>
            </TitledContainer>
        );
    }
}

const HourSetters = props => {
    return(
        <div id={props.day} className='mb-3'>
            <label>{props.day}</label>
                                    
            <div className='d-flex-between-center'>
                <div className='w-45'><input type='text' className='form-control' onChange={(e) => props.startTime(e.target.value)} maxLength='15' defaultValue={props.startValue} /></div>
                <div className='w-5 text-center'>-</div>
                <div className='w-45'><input type='text' className='form-control' onChange={(e) => props.endTime(e.target.value)} maxLength='15' defaultValue={props.endValue} /></div>
            </div>
        </div>
    )
}

BusinessHoursSettings.propTypes = {
    user: PropTypes.object
}

export default connect()(BusinessHoursSettings);