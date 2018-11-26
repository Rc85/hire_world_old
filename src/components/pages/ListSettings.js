import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SlideToggle from '../utils/SlideToggle';
import fetch from 'axios';
import Loading from '../utils/Loading';
import { Alert } from '../../actions/AlertActions';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { UncontrolledTooltip } from 'reactstrap';
import ListInfo from '../includes/page/ListInfo';
import moment from 'moment';
import { LogError } from '../utils/LogError';

class ListSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: '',
            showDetail: false,
            initialSettings: {
                listing_negotiable: false,
                listing_price_type: 'Hour',
                listing_title: '',
                listing_id: null,
                listing_renewed_date: null,
                listing_created_date: null,
                listing_sector: 'Artists',
                listing_price: '',
                listing_price_currency: '',
                listing_detail: '',
                listing_status: '',
            },
            newSettings: {
                listing_negotiable: false,
                listing_price_type: 'Hour',
                listing_title: '',
                listing_id: null,
                listing_renewed_date: null,
                listing_created_date: null,
                listing_sector: 'Artists',
                listing_price: '',
                listing_price_currency: '',
                listing_detail: '',
                listing_status: ''
            }
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Loading'});

        fetch.post('/api/get/listing')
        .then(resp => {
            if (resp.data.status === 'success') {
                if (resp.data.listing) {
                    this.initialSettings = {
                        listing_title: resp.data.listing.listing_title,
                        listing_id: resp.data.listing.listing_id,
                        listing_renewed_date: resp.data.listing.listing_renewed_date,
                        listing_created_date: resp.data.listing.listing_created_date,
                        listing_sector: resp.data.listing.listing_sector,
                        listing_price: resp.data.listing.listing_price,
                        listing_price_type: resp.data.listing.listing_price_type,
                        listing_price_currency: resp.data.listing.listing_price_currency,
                        listing_negotiable: resp.data.listing.listing_negotiable,
                        listing_detail: resp.data.listing.listing_detail,
                        listing_status: resp.data.listing.listing_status
                    }
                } else {
                    this.initialSettings = this.state.initialSettings;
                }

                this.setState({status: '', initialSettings: this.initialSettings, newSettings: this.initialSettings});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/get/listing'));
    }
    
    createListing() {
        let blankCheck = /^\s*$/;

        if (blankCheck.test(this.state.newSettings.listing_sector)) {
            this.props.dispatch(Alert('error', 'Sector required'));
        } else if (blankCheck.test(this.state.newSettings.listing_price)) {
            this.props.dispatch(Alert('error', 'Asking price required'));
        } else if (blankCheck.test(this.state.newSettings.listing_price_currency)) {
            this.props.dispatch(Alert('error', 'Preferred currency required'));
        } else if (blankCheck.test(this.state.newSettings.listing_title)) {
            this.props.dispatch(Alert('error', 'Title required'));
        } else {
            this.setState({status: 'Loading'});

            fetch.post('/api/listing/create', this.state.newSettings)
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.initialSettings = {
                        listing_title: resp.data.listing.listing_title,
                        listing_id: resp.data.listing.listing_id,
                        listing_renewed_date: resp.data.listing.listing_renewed_date,
                        listing_created_date: resp.data.listing.listing_created_date,
                        listing_sector: resp.data.listing.listing_sector,
                        listing_price: resp.data.listing.listing_price,
                        listing_price_type: resp.data.listing.listing_price_type,
                        listing_price_currency: resp.data.listing.listing_price_currency,
                        listing_negotiable: resp.data.listing.listing_negotiable,
                        listing_detail: resp.data.listing.listing_detail,
                        listing_status: resp.data.listing.listing_status
                    }

                    this.setState({status: '', initialSettings: this.initialSettings, newSettings: this.initialSettings});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                }

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            })
            .catch(err => LogError(err, '/api/listing/create'));
        }
    }

    toggleListing() {
        this.setState({status: 'Loading'});

        fetch.post('/api/listing/toggle', {listing_id: this.state.initialSettings.listing_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.initialSettings.listing_status = resp.data.listing_status;

                this.setState({status: '', initialSettings: this.initialSettings, newSettings: this.initialSettings});
            } else  if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/listing/toggle'));
    }

    updateListing() {
        this.setState({status: 'Loading'});

        fetch.post('/api/listing/edit', this.state.newSettings)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.initialSettings = {
                    listing_title: resp.data.listing.listing_title,
                    listing_id: resp.data.listing.listing_id,
                    listing_renewed_date: resp.data.listing.listing_renewed_date,
                    listing_created_date: resp.data.listing.listing_created_date,
                    listing_sector: resp.data.listing.listing_sector,
                    listing_price: resp.data.listing.listing_price,
                    listing_price_type: resp.data.listing.listing_price_type,
                    listing_price_currency: resp.data.listing.listing_price_currency,
                    listing_negotiable: resp.data.listing.listing_negotiable,
                    listing_detail: resp.data.listing.listing_detail,
                    listing_status: resp.data.listing.listing_status
                }

                this.setState({status: '', initialSettings: this.initialSettings, newSettings: this.initialSettings});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }
            
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/listing/edit'));
    }

    renewListing() {
        this.setState({status: 'Loading'});

        fetch.post('/api/listing/renew', {listing_id: this.state.initialSettings.listing_id})
        .then(resp => {
            this.initialSettings.listing_renewed_date = resp.data.renewedDate;

            this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage, initialSettings: this.initialSettings, newSettings: this.initialSettings});

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/listing/renew'));
    }

    setSettings(k, v) {
        let obj = {};
        obj[k] = v;
        let state = Object.assign({}, this.state.newSettings, obj);

        this.setState({newSettings: state});
    }
    
    render() {
        let status, sectors, buttons, listInfo;

        if (this.state.status === 'Loading') {
            status = <Loading size='7x' />;
        }

        if (this.props.sectors) {
            sectors = this.props.sectors.map((sector, i) => {
                return <option key={i} value={sector.sector}>{sector.sector}</option>;
            });
        }

        if (this.state.initialSettings.listing_created_date) {
            let now = new Date();
            let lastRenew = new Date(this.state.initialSettings.listing_renewed_date);

            buttons = <div className='d-flex-between-center mb-3'>
                <div>{this.state.initialSettings.listing_created_date !== this.state.initialSettings.listing_renewed_date ? <span>Renewed on {moment(this.state.initialSettings.listing_renewed_date).format('MMM DD YYYY hh:mm:ss')}</span> : ''}</div>
                <div className='d-flex-between-center'>
                    <SlideToggle status={this.state.initialSettings.listing_status === 'Active'} onClick={() => this.toggleListing()} />
                    <button id='renew-button' className='btn btn-primary ml-1' onClick={() => this.renewListing()} disabled={now - lastRenew < 8.64e+7}>Renew</button>
                    <UncontrolledTooltip placement='top' target='renew-button'>{now - lastRenew < 8.64e+7 ? <span>You must wait 24 hours from your last renew before you can renew again</span> : <span>Renewing your listing will bring it to the top of the list</span>}</UncontrolledTooltip>
                </div>
            </div>;
            listInfo = <ListInfo listing={this.state.initialSettings} />;
        }
        
        return(
            <section id='list-settings' className='blue-panel shallow three-rounded'>
                {this.props.user.user && this.props.user.user.account_type === 'User' ? <div className='alert alert-danger'>You need to be on a subscription plan to create a listing</div> : ''}
                {status}
                {buttons}

                {listInfo}

                <form>
                    <div className='d-flex-between-start mb-3'>
                        <div className='d-flex-between-start w-45'>
                            <div className='w-70'>
                                <label htmlFor='listing-title'>Title: <span className='required-asterisk'>*</span></label>
                                <input type='text' name='listing-title' id='listing-title' className='form-control' onChange={(e) => this.setSettings('listing_title', e.target.value)} defaultValue={this.state.initialSettings.listing_title} disabled={this.props.user.user && this.props.user.user.account_type === 'User'} />
                            </div>

                            <div className='w-25'>
                                <label htmlFor='listing-sector'>List Under: <span className='required-asterisk'>*</span></label>
                                <select name='sector' id='listing-sector' className='form-control' onChange={(e) => this.setSettings('listing_sector', e.target.value)} value={this.state.newSettings.listing_sector} disabled={this.props.user.user && this.props.user.user.account_type === 'User'}>
                                    {sectors}
                                </select>
                            </div>
                        </div>

                        <div className='w-45'>
                            <div className='d-flex-between-start mb-3'>
                                <div className='w-30'>
                                    <label htmlFor='listing-price'>Price Rate: <span className='required-asterisk'>*</span></label>
                                    <input type='number' name='price' id='listing-price' className='form-control' onChange={(e) => this.setSettings('listing_price', e.target.value)} defaultValue={this.state.initialSettings.listing_price} disabled={this.props.user.user && this.props.user.user.account_type === 'User'} />
                                </div>

                                <div className='w-30'>
                                    <label htmlFor='listing-price-type'>Per: <span className='required-asterisk'>*</span></label>
                                    <select name='listing-price-type' id='listing-price-type' className='form-control' onChange={(e) => this.setSettings('listing_price_type', e.target.value)} defaultValue={this.state.initialSettings.listing_price_type} disabled={this.props.user.user && this.props.user.user.account_type === 'User'}>
                                        <option value='Hour'>Hour</option>
                                        <option value='Bi-weekly'>Bi-weekly</option>
                                        <option value='Month'>Month</option>
                                        <option value='Delivery'>Delivery</option>
                                        <option value='One Time Payment'>One Time Payment</option>
                                    </select>
                                </div>

                                <div className='w-30'>
                                    <label htmlFor='listing-currency'>Currency: <span className='required-asterisk'>*</span></label>
                                    <input type='text' name='listing-currency' id='listing-currency' className='form-control' list='currency-list' maxLength='5' placeholder='Currency' onChange={(e) => this.setSettings('listing_price_currency', e.target.value)} defaultValue={this.state.initialSettings.listing_price_currency} disabled={this.props.user.user && this.props.user.user.account_type === 'User'} />
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
                            </div>

                            <label id='listing-negotiable-label' htmlFor='listing-negotiable'><input type='checkbox' name='listing-negotiable' id='listing-negotiable' onClick={() => this.setSettings('listing_negotiable', !this.state.newSettings.listing_negotiable)} checked={this.state.newSettings.listing_negotiable} disabled={this.props.user.user && this.props.user.user.account_type === 'User'} /> Negotiable</label>
                            <UncontrolledTooltip target='listing-negotiable-label' placement='top'>Enabling this will allow your clients to send you offers.</UncontrolledTooltip>
                        </div>
                    </div>

                    Details:

                    <textarea name='listing-detail' id='listing-detail' rows='10' className='form-control w-100 mb-3' placeholder='Describe the type of products or service you offer' onChange={(e) => this.setSettings('listing_detail', e.target.value)} defaultValue={this.state.initialSettings.listing_detail} disabled={this.props.user.user && this.props.user.user.account_type === 'User'}></textarea>

                    <div className='text-right'>
                        {this.state.initialSettings.listing_created_date ? <button type='button' className='btn btn-primary mr-1' onClick={() => this.updateListing()} disabled={JSON.stringify(this.initialSettings) === JSON.stringify(this.state.newSettings)}>Update</button> : <button type='button' className='btn btn-primary mr-1' onClick={() => this.createListing()} disabled={this.props.user.user && this.props.user.user.account_type === 'User'}>Create</button>}
                        <button type='reset' className='btn btn-secondary' onClick={() => this.setState({newSettings: this.initialSettings})} disabled={this.props.user.user && this.props.user.user.account_type === 'User'}>Clear</button>
                    </div>
                </form>
            </section>
        );
    }
}

ListSettings.propTypes = {
    user: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return {
        sectors: state.Sectors.sectors,
        confirm: state.Confirmation
    }
}

export default withRouter(connect(mapStateToProps)(ListSettings));