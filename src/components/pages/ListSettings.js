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
            sector: 'Artists',
            price: '',
            currency: '',
            detail: '',
            listingStatus: '',
            listing: {
                negotiable: false,
                priceType: 'Hour',
                title: '',
                id: null,
                date: null,
                sector: 'Artists',
                price: '',
                currency: '',
                detail: '',
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
                    sector: resp.data.listing.listing_sector,
                    price: resp.data.listing.listing_price,
                    priceType: resp.data.listing.listing_price_type,
                    currency: resp.data.listing.listing_price_currency,
                    negotiable: resp.data.listing.listing_negotiable,
                    detail: resp.data.listing.listing_detail,
                    listing: {
                        title: resp.data.listing.listing_title,
                        id: resp.data.listing.listing_id,
                        date: resp.data.listing.listing_created_date,
                        sector: resp.data.listing.listing_sector,
                        price: resp.data.listing.listing_price,
                        priceType: resp.data.listing.listing_price_type,
                        currency: resp.data.listing.listing_price_currency,
                        negotiable: resp.data.listing.listing_negotiable,
                        detail: resp.data.listing.listing_detail
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
                        sector: resp.data.listing.listing_sector,
                        price: resp.data.listing.listing_price,
                        priceType: resp.data.listing.listing_price_type,
                        currency: resp.data.listing.listing_price_currency,
                        negotiable: resp.data.listing.listing_negotiable,
                        detail: resp.data.listing.listing_detail,
                        listing: {
                            title: resp.data.listing.listing_title,
                            id: resp.data.listing.listing_id,
                            date: resp.data.listing.listing_created_date,
                            sector: resp.data.listing.listing_sector,
                            price: resp.data.listing.listing_price,
                            priceType: resp.data.listing.listing_price_type,
                            currency: resp.data.listing.listing_price_currency,
                            negotiable: resp.data.listing.listing_negotiable,
                            detail: resp.data.listing.listing_detail
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
                        title: resp.data.listing.listing_title,
                        sector: resp.data.listing.listing_sector,
                        price: resp.data.listing.listing_price,
                        priceType: resp.data.listing.listing_price_type,
                        currency: resp.data.listing.listing_price_currency,
                        negotiable: resp.data.listing.listing_negotiable,
                        detail: resp.data.listing.listing_detail
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
        let status, sectors, toggleButton, listInfo;

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
            toggleButton = <div className='d-flex-end-center mb-3'><SlideToggle status={this.state.listingStatus === 'Active'} onClick={() => this.toggleListing()} /></div>;
            listInfo = <ListInfo listing={this.state.listing} />;
        }
        
        return (
            <section id='list-settings' className='blue-panel shallow three-rounded'>
                {this.props.user.user.account_type === 'User' ? <div className='alert alert-danger'>You need to be on a subscription plan to create a listing</div> : ''}
                {status}
                {toggleButton}

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

};

const mapStateToProps = state => {
    return {
        sectors: state.Sectors.sectors
    }
}

export default withRouter(connect(mapStateToProps)(ListSettings));