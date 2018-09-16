import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import PropTypes from 'prop-types';

class ServiceForm extends Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    componentDidMount() {
        if (this.props.service) {
            this.setState(this.props.service);
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
        console.log(this.state)
        let options;

        if (this.props.sectors) {
            options = this.props.sectors.map((sector, i) => {
                return <option key={i} value={sector.sector}>{sector.sector}</option>
            });
        }
        
        return(
            <div className='service-form rounded'>
                <label htmlFor='service-name'>Name: <span className='required-asterisk'>*</span></label>
                <input type='text' name='service_name' id='service-name' defaultValue={this.state.service_name} className='form-control mb-3' placeholder='Think of something unique and catchy' required
                onChange={(e) => {
                    this.setState({service_name: e.target.value});
                }} />

                <label htmlFor='service-details'>Details:</label>
                <textarea name='service_details' id='service-details' rows='10' className='form-control w-100 mb-3' placeholder='Try to be as detail as possible' defaultValue={this.state.service_detail}
                onChange={(e) => {
                    this.setState({service_detail: e.target.value});
                }}></textarea>

                <label htmlFor='list-under'>List Under: <span className='required-asterisk'>*</span></label>
                <select name='list_under' id='list-under' className='form-control mb-3' required value={this.state.service_listed_under}
                onChange={(e) => {
                    this.setState({service_listed_under: e.target.value});
                }}>
                    <option>-</option>
                    {options}
                </select>

                <div className='bordered-container rounded mb-3'>
                    <div><label>Location: <span className='required-asterisk'>*</span></label></div>

                    <small>If you have an online business or a product that you sell internationally, select world-wide. If your business is conducted locally, then narrow down your location.</small>

                    <div><label htmlFor='worldwide'><input type='checkbox' name='worldwide' id='worldwide' className='form-checkbox mt-3' defaultChecked={this.state.service_worldwide}
                        onChange={() => {
                            this.setState({
                                service_worldwide: !this.state.worldwide,
                                service_country: '',
                                service_region: '',
                                service_city: ''
                            });
                        }} /> World-wide/Online</label>
                    </div>
    
                    <label htmlFor='country'>Country:</label>
                    <CountryDropdown classes='form-control mb-1' name='country' value={this.state.service_country} onChange={(val) => this.setState({service_country: val})} disabled={this.state.service_worldwide ? true : false} />
    
                    <label htmlFor='region'>Region:</label>
                    <RegionDropdown classes='form-control mb-1' name='region' country={this.state.service_country} value={this.state.service_region} onChange={(val) => this.setState({service_region: val})} disabled={this.state.service_worldwide ? true : false} />
    
                    <label htmlFor='city'>City:</label>
                    <input type='text' name='city' id='city' className='form-control' onChange={(e) => {this.setState({service_city: e.target.value})}} disabled={this.state.service_worldwide ? true : false} defaultValue={this.state.service_city} />
                </div>
                
                <div className='bordered-container rounded mb-3'>
                    <label htmlFor='negotiable'><input type='checkbox' name='negotiable' id='negotiable' className='form-checkbox' defaultChecked={this.state.service_negotiable} onClick={() => this.setState({service_negotiable: !this.state.service_negotiable})} /> Negotiable</label>

                    <div className='d-flex-between-center mb-3'>
                        <div className='w-30'>
                            <label htmlFor='price'>Price Rate: {!this.state.service_negotiable ? <span className='required-asterisk'>*</span> : ''}</label>
                            <input type='number' name='price' id='price' className='form-control' defaultValue={this.state.service_price_rate} disabled={this.state.service_negotiable} onChange={(e) => this.setState({service_price_rate: e.target.value})} />
                        </div>

                        <div className='w-30'>
                            <label htmlFor='currency-input'>Currency: {!this.state.service_negotiable ? <span className='required-asterisk'>*</span> : ''}</label>
                            <input type='text' name='currency' id='currency-input' list='currency-list' className='form-control' onChange={(e) => this.setState({service_price_currency: e.target.value})} defaultValue={this.state.service_price_currency}/>
                            <datalist id='currency-list'>
                                <option value='USD'>USD</option>
                                <option value='CAD'>CAD</option>
                                <option value='AUD'>AUD</option>
                                <option value='EUR'>EUR</option>
                                <option value='GBP'>GBP</option>
                                <option value='CNY'>CNY</option>
                                <option value='JPY'>JPY</option>
                            </datalist>
                        </div>

                        <div className='w-30'>
                            <label htmlFor='price-type'>Charged By: {!this.state.service_negotiable ? <span className='required-asterisk'>*</span> : ''}</label>
                            <select name='price-type' id='price-type' className='form-control' value={this.state.service_price_rate_type} disabled={this.state.service_negotiable} onChange={(e) => this.setState({service_price_rate_type: e.target.value})}>
                                <option value='Hourly'>Hourly</option>
                                <option value='Half Half'>Iterations</option>
                                <option value='One Time'>One Time</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className='text-right mb-3'>
                    <button className='btn btn-primary mr-1' onClick={() => this.props.submit(this.state)}>Submit</button>
                    <button className='btn btn-secondary' onClick={() => this.props.cancel()}>Cancel</button>
                </div>

                <div className='text-right'><span className='text-muted'><small>Listing ID: {this.state.service_id}</small></span></div>
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