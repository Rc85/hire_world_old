import React, { Component } from 'react';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import SlideToggle from '../../utils/SlideToggle';
import { connect } from 'react-redux';
import { SaveLocations } from '../../../actions/SettingsActions';
import SubmitButton from '../../utils/SubmitButton';
import Alert from '../../utils/Alert';

class LocationSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            worldwide: false,
            country: undefined,
            region: undefined,
            city: null,
            defaultLocation: false,
            error: null
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
            this.setState({error: 'required fields'});
        } else if (!cityCheck.test(this.state.city)) {
            this.setState({error: 'invalid city'});
        } else {
            this.props.dispatch(SaveLocations(this.state, this.props.user.user));
        }

        setTimeout(() => {
            this.setState({error: null});
        }, 2300);
    }

    render() {
        let message, error;

        if (this.props.user.user) {
            if (this.props.user.status === 'save locations success') {
                message = <Alert status='success' message='Locations setting saved' />;
            } else if (this.props.user.status === 'save locations fail') {
                message = <Alert status='error' message='Unable to save' />;
            } else if (this.props.user.status === 'save locations error') {
                message = <Alert status='error' message='An error occurred' />;
            }
        }

        if (this.state.error === 'required fields') {
            error = <Alert status='error' message='Required fields cannot be blank' />
        } else if (this.state.error === 'invalid city') {
            error = <Alert status='error' message='Invalid city name' />
        }

        return(
            <div id='location-settings'>
                {error}
                {message}
                <div className='d-flex align-items-center mb-1'>
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

                    <SubmitButton type='button' value='Save' onClick={() => this.save()} loading={this.props.user.status} />
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login
    }
}

export default connect(mapStateToProps)(LocationSettings);