import React, { Component } from 'react';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import SlideToggle from '../../utils/SlideToggle';
import { connect } from 'react-redux';
import { SaveLocations } from '../../../actions/SettingsActions';
import SubmitButton from '../../utils/SubmitButton';
import Alert from '../../utils/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { UncontrolledTooltip } from 'reactstrap';
import PropTypes from 'prop-types';

class LocationSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            worldwide: false,
            country: undefined,
            region: undefined,
            city: null,
            defaultLocation: false,
            status: '',
            statusMessage: ''
        }
    }

    componentDidMount() {
        if (this.props.user.user) {
            this.setState({
                worldwide: this.props.user.user.user_worldwide,
                country: this.props.user.user.user_country === null ? undefined : this.props.user.user.user_country,
                region: this.props.user.user.user_region === null? undefined : this.props.user.user.user_region,
                city: this.props.user.user.user_city,
                defaultLocation: this.props.user.user.default_location
            });
        }
    }

    save() {
        let cityCheck = /^[a-zA-Z]*$/;

        if (!this.state.worldwide && !this.state.country) {
            this.setState({
                status: 'error',
                statusMessage: 'Required fields cannot be blank'
            });
        } else if (!cityCheck.test(this.state.city)) {
            this.setState({
                status: 'error',
                statusMessage: 'Invalid city name'
            });
        } else {
            this.props.dispatch(SaveLocations(this.state, this.props.user.user));
        }
    }

    render() {
        let message, status;

        switch(this.props.user.status) {
            case 'save locations success': message = <Alert status='success' message='Locations setting saved' unmount={() => this.setState({status: '', statusMessage: ''})} />; break;
            case 'save locations fail': message = <Alert status='error' message='Unable to save' unmount={() => this.setState({status: '', statusMessage: ''})} />; break;
            case 'save locations error': message = <Alert status='error' message='An error occurred' unmount={() => this.setState({status: '', statusMessage: ''})} />; break;
        }

        if (this.state.status) {
            status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />
        }

        return(
            <div id='location-settings'>
                {status}
                {message}
                <div className='d-flex align-items-center mb-1'>
                    <div className='d-flex justify-content-end mr-2'>
                        <div id='location-tip' className='d-inline-flex'><FontAwesomeIcon icon={faQuestionCircle} size='1x' /></div>
                        <UncontrolledTooltip target='location-tip' placement='top'>For online business or products that you can ship internationally</UncontrolledTooltip>
                    </div>

                    <span>Worldwide:</span>

                    <div className='ml-1'><SlideToggle status={this.state.worldwide ? 'Active' : 'Inactive'} onClick={() => this.setState({
                        worldwide: !this.state.worldwide,
                        country: undefined,
                        region: undefined,
                        city: undefined
                    })} /></div>
                </div>

                <div className='mb-3'>
                    <label>Country:</label>
                    <CountryDropdown classes='form-control' value={this.state.country} onChange={(val) => {this.setState({country: val})}} disabled={this.state.worldwide} />
                </div>

                <div className='mb-3'>
                    <label>Region:</label>
                    <RegionDropdown classes='form-control' value={this.state.region} country={this.state.country} onChange={(val) => this.setState({region: val})} disabled={this.state.worldwide} />
                </div>

                <div className='mb-3'>
                    <label>City:</label>
                    <input type='text' name='city' className='form-control' onChange={(e) => this.setState({city: e.target.value})} disabled={this.state.worldwide} defaultValue={this.state.city} />
                </div>

                <div className='settings-row'>
                    <div className='settings-row mr-1'>
                        <span>Set as default location:</span>
                        <div className='ml-1'><SlideToggle status={this.state.defaultLocation ? 'Active' : 'Inactive'} onClick={() => this.setState({defaultLocation: !this.state.defaultLocation})} /></div>
                    </div>

                    <SubmitButton type='button' value='Save' loading={/loading$/.test(this.props.user.status)} onClick={() => this.save()} />
                </div>
            </div>
        )
    }
}

LocationSettings.propTypes = {
    user: PropTypes.object.isRequired
}

export default connect()(LocationSettings);