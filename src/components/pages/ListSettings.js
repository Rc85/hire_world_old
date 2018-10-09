import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SlideToggle from '../utils/SlideToggle';
import fetch from 'axios';
import Loading from '../utils/Loading';
import Alert from '../utils/Alert';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { UncontrolledTooltip } from 'reactstrap';
import ListInfo from '../includes/page/ListInfo';
import { ShowConfirmation } from '../../actions/ConfirmationActions';

class ListSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: '',
            negotiable: false,
            showDetail: false,
            priceType: 'Hour',
            title: '',
            id: null,
            date: null,
            renewedDate: null,
            sector: 'Artists',
            price: '',
            currency: '',
            detail: '',
            listingStatus: '',
            listing: {
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
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data && nextProps.confirm.option) {
            if (nextProps.confirm.data.action === 'renew listing') {
                fetch.post('/api/listing/renew', nextProps.confirm.data)
                .then(resp => {
                    if (resp.data.status === 'success') {
                        this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage, listing: resp.data.listing});
                    } else {
                        this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                    }
                });
            }
        }
    }
    
    
    componentDidMount() {
        this.setState({status: 'Loading'});

        fetch.post('/api/get/listing', {user_id: this.props.user.user.user_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({
                    status: '',
                    title: resp.data.listing.listing_title,
                    id: resp.data.listing.listing_id,
                    date: resp.data.listing.listing_created_date,
                    renewedDate: resp.data.listing.listing_renewed_date,
                    sector: resp.data.listing.listing_sector,
                    price: resp.data.listing.listing_price,
                    priceType: resp.data.listing.listing_price_type,
                    currency: resp.data.listing.listing_price_currency,
                    negotiable: resp.data.listing.listing_negotiable,
                    detail: resp.data.listing.listing_detail,
                    listing: {
                        listing_title: resp.data.listing.listing_title,
                        listing_id: resp.data.listing.listing_id,
                        listing_renewed_date: resp.data.listing.listing_renewed_date,
                        listing_created_date: resp.data.listing.listing_created_date,
                        listing_sector: resp.data.listing.listing_sector,
                        listing_price: resp.data.listing.listing_price,
                        listing_price_type: resp.data.listing.listing_price_type,
                        listing_price_currency: resp.data.listing.listing_price_currency,
                        listing_negotiable: resp.data.listing.listing_negotiable,
                        listing_detail: resp.data.listing.listing_detail
                    },
                    listingStatus: resp.data.listing.listing_status
                });
            } else if (resp.data.status === 'error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            } else {
                this.setState({status: '', statusMessage: ''});
            }
        })
        .catch(err => console.log(err));
    }

    createListing() {
        let blankCheck = /^\s*$/;

        if (blankCheck.test(this.state.sector)) {
            this.setState({status: 'error', statusMessage: 'Sector required'});
        } else if (blankCheck.test(this.state.price)) {
            this.setState({status: 'error', statusMessage: 'Asking price required'});
        } else if (blankCheck.test(this.state.currency)) {
            this.setState({status: 'error', statusMessage: 'Preferred currency required'});
        } else if (blankCheck.test(this.state.title)) {
            this.setState({status: 'error', statusMessage: 'Title required'});
        } else {
            this.setState({status: 'Loading'});

            fetch.post('/api/listing/create', this.state)
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({
                        status: '',
                        title: resp.data.listing.listing_title,
                        id: resp.data.listing.listing_id,
                        date: resp.data.listing.listing_created_date,
                        renewedDate: resp.data.listing.listing_renewed_date,
                        sector: resp.data.listing.listing_sector,
                        price: resp.data.listing.listing_price,
                        priceType: resp.data.listing.listing_price_type,
                        currency: resp.data.listing.listing_price_currency,
                        negotiable: resp.data.listing.listing_negotiable,
                        detail: resp.data.listing.listing_detail,
                        listing: {
                            listing_title: resp.data.listing.listing_title,
                            listing_id: resp.data.listing.listing_id,
                            listing_renewed_date: resp.data.listing.listing_renewed_date,
                            listing_created_date: resp.data.listing.listing_created_date,
                            listing_sector: resp.data.listing.listing_sector,
                            listing_price: resp.data.listing.listing_price,
                            listing_price_type: resp.data.listing.listing_price_type,
                            listing_price_currency: resp.data.listing.listing_price_currency,
                            listing_negotiable: resp.data.listing.listing_negotiable,
                            listing_detail: resp.data.listing.listing_detail
                        },
                        listingStatus: resp.data.listing.listing_status
                    });
                } else {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => console.log(err));
        }
    }

    toggleListing() {
        this.setState({status: 'Loading'});

        fetch.post('/api/listing/toggle', {listing_id: this.state.id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listingStatus: resp.data.listing_status});
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    updateListing() {
        this.setState({status: 'Loading'});

        fetch.post('/api/listing/edit', this.state)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({
                    status: resp.data.status,
                    statusMessage: resp.data.statusMessage,
                    title: resp.data.listing.listing_title,
                    sector: resp.data.listing.listing_sector,
                    price: resp.data.listing.listing_price,
                    priceType: resp.data.listing.listing_price_type,
                    currency: resp.data.listing.listing_price_currency,
                    negotiable: resp.data.listing.listing_negotiable,
                    detail: resp.data.listing.listing_detail,
                    listing: {
                        listing_id: resp.data.listing.listing_id,
                        listing_title: resp.data.listing.listing_title,
                        listing_sector: resp.data.listing.listing_sector,
                        listing_price: resp.data.listing.listing_price,
                        listing_price_type: resp.data.listing.listing_price_type,
                        listing_price_currency: resp.data.listing.listing_price_currency,
                        listing_negotiable: resp.data.listing.listing_negotiable,
                        listing_detail: resp.data.listing.listing_detail
                    }
                });
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }
    
    render() {
        console.log(this.state)
        let status, sectors, buttons, listInfo;

        if (this.state.status === 'Loading') {
            status = <Loading size='7x' />;
        } else if (this.state.status === 'success' || this.state.status === 'error') {
            status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />;
        }

        if (this.props.sectors) {
            sectors = this.props.sectors.map((sector, i) => {
                return <option key={i} value={sector.sector}>{sector.sector}</option>;
            });
        }

        if (this.state.date) {
            let now = new Date();
            let lastRenew = new Date(this.state.renewedDate);

            console.log(now - lastRenew)

            buttons = <div className='d-flex-between-center mb-3'>
                <div>{this.state.date !== this.state.renewedDate ? <span>Renewed on {this.state.renewedDate}</span> : ''}</div>
                <div className='d-flex-between-center'>
                    <SlideToggle status={this.state.listingStatus === 'Active'} onClick={() => this.toggleListing()} />
                    <button id='renew-button' className='btn btn-primary ml-1' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to spend 50 credits to renew your listing?', false, {id: this.state.id, action: 'renew listing'}))} disabled={now - lastRenew < 8.64e+7}>Renew</button>
                    <UncontrolledTooltip placement='top' target='renew-button'>{now - lastRenew < 8.64e+7 ? <span>You must wait 24 hours from your last renew before you can renew again</span> : <span>Renewing your listing will bring it to the top of the list</span>}</UncontrolledTooltip>
                </div>
            </div>;
            listInfo = <ListInfo listing={this.state.listing} />;
        }
        
        return (
            <section id='list-settings' className='blue-panel shallow three-rounded'>
                {this.props.user.user.account_type === 'User' ? <div className='alert alert-danger'>You need to be on a subscription plan to create a listing</div> : ''}
                {status}
                {buttons}

                {listInfo}

                <form>
                    <div className='d-flex-between-start mb-3'>
                        <div className='d-flex-between-start w-45'>
                            <div className='w-70'>
                                <label htmlFor='listing-title'>Title: <span className='required-asterisk'>*</span></label>
                                <input type='text' name='listing-title' id='listing-title' className='form-control' onChange={(e) => this.setState({title: e.target.value})} defaultValue={this.state.title} disabled={this.props.user.user.account_type === 'User'} />
                            </div>

                            <div className='w-25'>
                                <label htmlFor='listing-sector'>List Under: <span className='required-asterisk'>*</span></label>
                                <select name='sector' id='listing-sector' className='form-control' onChange={(e) => this.setState({sector: e.target.value})} value={this.state.sector} disabled={this.props.user.user.account_type === 'User'}>
                                    {sectors}
                                </select>
                            </div>
                        </div>

                        <div className='w-45'>
                            <div className='d-flex-between-start mb-3'>
                                <div className='w-30'>
                                    <label htmlFor='listing-price'>Price Rate: <span className='required-asterisk'>*</span></label>
                                    <input type='number' name='price' id='listing-price' className='form-control' onChange={(e) => this.setState({price: e.target.value})} defaultValue={this.state.price} disabled={this.props.user.user.account_type === 'User'} />
                                </div>

                                <div className='w-30'>
                                    <label htmlFor='listing-price-type'>Per: <span className='required-asterisk'>*</span></label>
                                    <select name='listing-price-type' id='listing-price-type' className='form-control' onChange={(e) => this.setState({priceType: e.target.value})} value={this.state.priceType} disabled={this.props.user.user.account_type === 'User'}>
                                        <option value='Hour'>Hour</option>
                                        <option value='Bi-weekly'>Bi-weekly</option>
                                        <option value='Month'>Month</option>
                                        <option value='Delivery'>Delivery</option>
                                        <option value='One Time Payment'>One Time Payment</option>
                                    </select>
                                </div>

                                <div className='w-30'>
                                    <label htmlFor='listing-currency'>Currency: <span className='required-asterisk'>*</span></label>
                                    <input type='text' name='listing-currency' id='listing-currency' className='form-control' list='currency-list' maxLength='5' placeholder='Currency' onChange={(e) => this.setState({currency: e.target.value})} defaultValue={this.state.currency} disabled={this.props.user.user.account_type === 'User'} />
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

                            <label id='listing-negotiable-label' htmlFor='listing-negotiable'><input type='checkbox' name='listing-negotiable' id='listing-negotiable' onClick={() => this.setState({negotiable: !this.state.negotiable})} checked={this.state.negotiable} disabled={this.props.user.user.account_type === 'User'} /> Negotiable</label>
                            <UncontrolledTooltip target='listing-negotiable-label' placement='top'>Enabling this will allow your clients to send you offers.</UncontrolledTooltip>
                        </div>
                    </div>

                    Details:

                    <textarea name='listing-detail' id='listing-detail' rows='10' className='form-control w-100 mb-3' placeholder='Describe the type of products or service you offer' onChange={(e) => this.setState({detail: e.target.value})} value={this.state.detail} disabled={this.props.user.user.account_type === 'User'}></textarea>

                    <div className='text-right'>
                        {this.state.date ? <button type='button' className='btn btn-primary mr-1' onClick={() => this.updateListing()}>Update</button> : <button type='button' className='btn btn-primary mr-1' onClick={() => this.createListing()} disabled={this.props.user.user.account_type === 'User'}>Create</button>}
                        <button type='reset' className='btn btn-secondary' onClick={() => this.setState({
                            title: '',
                            sector: '',
                            price: '',
                            priceType: '',
                            currency: '',
                            negotiable: '',
                            detail: ''                       
                        })} disabled={this.props.user.user.account_type === 'User'}>Clear</button>
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