import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import PropTypes from 'prop-types';

class ServiceForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            detail: '',
            listUnder: '',
            worldwide: false,
            country: '',
            region: '',
            city: ''
        }
    }

    componentDidMount() {
        if (this.props.service) {
            this.setState({
                name: this.props.service.service_name,
                detail: this.props.service.service_detail,
                listUnder: this.props.service.service_listed_under,
                worldwide: this.props.service.service_worldwide,
                country: this.props.service.service_country,
                region: this.props.service.service_region,
                city: this.props.service.service_city
            });
        } else if (this.props.user && this.props.user.user.default_location) {
            this.setState({
                worldwide: this.props.user.user.user_worldwide,
                country: this.props.user.user.user_country === null ? '' : this.props.user.user.user_country,
                region: this.props.user.user.user_region === null ? '' : this.props.user.user.user_region,
                city: this.props.user.user.user_city
            });
        }
    }

    render() {
        let options;

        if (this.props.sectors) {
            options = this.props.sectors.map((sector, i) => {
                return <option key={i} value={sector.sector}>{sector.sector}</option>
            });
        }
        
        return(
            <div className='service-form rounded'>
                <label htmlFor='service-name'>Name: <span className='required-asterisk'>*</span></label>
                <input type='text' name='service_name' id='service-name' value={this.state.name} className='form-control mb-3' placeholder='Think of something unique and catchy' required
                onChange={(e) => {
                    this.setState({name: e.target.value});
                }} />

                <label htmlFor='service-details'>Details:</label>
                <div><small>Be as detail as you can. If your services have sub-services, list them and briefly describe them if they're not already self-explanatory.</small></div>
                <textarea name='service_details' id='service-details' rows='10' className='form-control w-100 mb-3' placeholder='Try to be as detail as possible' value={this.state.detail}
                onChange={(e) => {
                    this.setState({detail: e.target.value});
                }}></textarea>

                <label htmlFor='list-under'>List Services Under: <span className='required-asterisk'>*</span></label>
                <select name='list_under' id='list-under' className='form-control mb-3' required value={this.state.listUnder}
                onChange={(e) => {
                    this.setState({listUnder: e.target.value});
                }}>
                    <option>-</option>
                    {options}
                </select>

                <div className='bordered-container rounded mb-1'>
                    <div><label>Location: <span className='required-asterisk'>*</span></label></div>

                    <small>If you have an online business or a product that you sell internationally, select world-wide. If your business is conducted locally, then narrow down your location.</small>

                    <div><label htmlFor='worldwide'><input type='checkbox' name='worldwide' id='worldwide' className='form-checkbox mt-3' checked={this.state.worldwide}
                        onChange={() => {
                            this.setState({
                                worldwide: !this.state.worldwide,
                                country: '',
                                region: '',
                                city: ''
                            });
                        }} /> World-wide</label>
                    </div>
    
                    <label htmlFor='country'>Country:</label>
                    <CountryDropdown classes='form-control mb-1' name='country' value={this.state.country} onChange={(val) => this.setState({country: val})} disabled={this.state.worldwide ? true : false} />
    
                    <label htmlFor='region'>Region:</label>
                    <RegionDropdown classes='form-control mb-1' name='region' country={this.state.country} value={this.state.region} onChange={(val) => this.setState({region: val})} disabled={this.state.worldwide ? true : false} />
    
                    <label htmlFor='city'>City:</label>
                    <input type='text' name='city' id='city' className='form-control' onChange={(e) => {this.setState({city: e.target.value})}} disabled={this.state.worldwide ? true : false} defaultValue={this.state.city} />
                </div>

                <div className='text-right'>
                    <button className='btn btn-primary mr-1' onClick={() => this.props.submit(this.state)}>Submit</button>
                    <button className='btn btn-secondary' onClick={() => this.props.cancel()}>Cancel</button>
                </div>
            </div>
        )
    }
}

ServiceForm.propTypes = {
    service: PropTypes.shape({
        service_city: PropTypes.string,
        service_country: PropTypes.string,
        service_detail: PropTypes.string,
        service_id: PropTypes.number.isRequired,
        service_listed_under: PropTypes.string.isRequired,
        service_name: PropTypes.string.isRequired,
        service_provided_by: PropTypes.string.isRequired,
        service_region: PropTypes.string,
        service_status: PropTypes.string.isRequired,
        service_worldwide: PropTypes.bool
    }),
    submit: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    user: PropTypes.object
}

const mapStateToProps = state => {
    return {
        sectors: state.Sectors.sectors
    }
}

export default connect(mapStateToProps)(ServiceForm);