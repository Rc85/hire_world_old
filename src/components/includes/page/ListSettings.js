import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SlideToggle from '../../utils/SlideToggle';
import fetch from 'axios';
import Loading from '../../utils/Loading';
import { Alert } from '../../../actions/AlertActions';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import { UncontrolledTooltip } from 'reactstrap';
import moment from 'moment';
import { LogError } from '../../utils/LogError';
import { GetSectors, GetSession } from '../../../actions/FetchActions';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';

class ListSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: '',
            showDetail: false,
            listing_negotiable: false,
            listing_price_type: 'Hour',
            listing_id: null,
            listing_renewed_date: null,
            listing_created_date: null,
            listing_sector: 'Artists',
            listing_price: '',
            listing_price_currency: '',
            listing_detail: '',
            listing_status: '',
            listing_title: '',
            listing_purpose: ''
        }
    }
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data) {
            if (nextProps.confirm.data.action === 'unsubscribe' && nextProps.confirm.option) {
                this.cancelSubscription();
                this.props.dispatch(ResetConfirmation());
            }
        }
    }
    
    componentDidMount() {
        this.props.dispatch(GetSectors());
        this.setState({status: 'Loading'});

        fetch.post('/api/get/listing')
        .then(resp => {
            if (resp.data.status === 'success') {
                let newState = {...this.state, ...resp.data.listing};
                newState.status = '';

                this.setState(newState);
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/get/listing'));
    }
    
    toggleListing() {
        this.setState({status: 'Loading'});

        fetch.post('/api/listing/toggle', this.state)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listing_status: resp.data.listing.listing_status});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/listing/toggle'));
    }

    renewListing() {
        this.setState({status: 'Loading'});

        fetch.post('/api/listing/renew', {listing_id: this.state.listing_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let newState = {...this.state}
                newState.listing_renewed_date = resp.data.renewedDate;
                this.setState(newState);
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/listing/renew'));
    }

    cancelSubscription() {
        this.setState({status: 'Loading'});

        fetch.post('/api/user/subscription/cancel')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: 'Unsubscribed'});
                this.props.dispatch(GetSession());
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/user/subscription/cancel'));
    }

    render() {
        let status, sectors, renewButton, unsubscribeButton;

        if (this.state.status === 'Loading') {
            status = <Loading size='7x' />;
        } else if (this.state.status === 'Unsubscribed') {
            return <Redirect to='/subscription/cancelled' />;
        }

        if (this.props.sectors) {
            sectors = this.props.sectors.map((sector, i) => {
                return <option key={i} value={sector.sector}>{sector.sector}</option>;
            });
        }

        if (this.state.listing_created_date) {
            let now = new Date();
            let lastRenew = new Date(this.state.listing_renewed_date);

            renewButton = <React.Fragment>
                <button id='renew-button' className='btn btn-primary ml-1' onClick={() => this.renewListing()} disabled={now - lastRenew < 8.64e+7}>Renew</button>
                <UncontrolledTooltip placement='top' target='renew-button' delay={0}>{now - lastRenew < 8.64e+7 ? <span>You must wait 24 hours from your last renew before you can renew again</span> : <span>Renewing your listing will bring it to the top of the list</span>}</UncontrolledTooltip>
            </React.Fragment>;
        }

        if (this.props.user.user && this.props.user.user.is_subscribed) {
            unsubscribeButton = <React.Fragment><button id='unsubscribe-listing-button' className='btn btn-danger ml-1' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to unsubscribe?', false, {action: 'unsubscribe'}))}>Unsubscribe</button>
            <UncontrolledTooltip placement='top' target='unsubscribe-listing-button' delay={0}>Cancel your listing subscription</UncontrolledTooltip></React.Fragment>;
        }
        
        return(
            <section id='list-settings'>
                {this.props.user.user && this.props.user.user.account_type === 'User' ? <div className='alert alert-danger'>You need to be on a subscription plan to create a listing</div> : ''}
                {status}

                <div className='d-flex-between-center mb-3'>
                    <div>{this.state.listing_created_date !== this.state.listing_renewed_date ? <span>Renewed on {moment(this.state.listing_renewed_date).format('MMM DD YYYY hh:mm:ss')}</span> : ''}</div>
                    <div className='d-flex-between-center'>
                        <SlideToggle status={this.state.listing_status === 'Active'} onClick={() => this.toggleListing()} />
                        {renewButton}
                        {unsubscribeButton}
                    </div>
                </div>

                <div className='d-flex mb-3'>
                    <label className='w-5' htmlFor='looking'>I am</label>

                    <div className='w-15'><input type='radio' name='looking' value='For Hire' onClick={(e) => this.setState({listing_purpose: e.target.value})} disabled={this.state.listing_status === 'Active'} checked={this.state.listing_purpose === 'For Hire'} /> Looking for work</div>
                    <div className='w-15'><input type='radio' name='looking' value='Hiring' onClick={(e) => this.setState({listing_purpose: e.target.value})} disabled={this.state.listing_status === 'Active'} checked={this.state.listing_purpose === 'Hiring'} /> Looking to hire</div>
                </div>

                <div className='mb-3'>
                    <label htmlFor='listing-title'>List Title: <span className='required-asterisk'>*</span></label>
                    <input type='text' name='title' id='listing-title' className='form-control' onChange={(e) => this.setState({listing_title: e.target.value})} defaultValue={this.state.listing_title} disabled={this.state.listing_status === 'Active'} />
                </div>

                <div className='d-flex-between-start mb-3'>
                    <div className='w-45'>
                        <label htmlFor='listing-sector'>List Under: <span className='required-asterisk'>*</span></label>
                        <select name='sector' id='listing-sector' className='form-control' onChange={(e) => this.setState({listing_sector: e.target.value})} value={this.state.listing_sector} disabled={this.state.listing_status === 'Active'} >
                            {sectors}
                        </select>
                    </div>

                    <div className='w-50'>
                        <div className='d-flex-between-start mb-3'>
                            <div className='w-30'>
                                <label htmlFor='listing-price'>Price Rate: <span className='required-asterisk'>*</span></label>
                                <input type='number' name='price' id='listing-price' className='form-control' onChange={(e) => this.setState({listing_price: e.target.value})} defaultValue={this.state.listing_price} disabled={this.state.listing_status === 'Active'} />
                            </div>

                            <div className='w-30'>
                                <label htmlFor='listing-price-type'>Per: <span className='required-asterisk'>*</span></label>
                                <select name='listing-price-type' id='listing-price-type' className='form-control' onChange={(e) => this.setState({listing_price_type: e.target.value})} defaultValue={this.state.listing_price_type}  disabled={this.state.listing_status === 'Active'}>
                                    <option value='Hour'>Hour</option>
                                    <option value='Bi-weekly'>Bi-weekly</option>
                                    <option value='Month'>Month</option>
                                    <option value='Delivery'>Delivery</option>
                                    <option value='One Time Payment'>One Time Payment</option>
                                </select>
                            </div>

                            <div className='w-30'>
                                <label htmlFor='listing-currency'>Currency: <span className='required-asterisk'>*</span></label>
                                <input type='text' name='listing-currency' id='listing-currency' className='form-control' list='currency-list' maxLength='5' placeholder='Currency' onChange={(e) => this.setState({listing_price_currency: e.target.value})} defaultValue={this.state.listing_price_currency} disabled={this.state.listing_status === 'Active'} />
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

                        <label id='listing-negotiable-label' htmlFor='listing-negotiable'><input type='checkbox' name='listing-negotiable' id='listing-negotiable' onClick={() => this.setState({listing_negotiable: !this.state.listing_negotiable})} checked={this.state.listing_negotiable} disabled={this.state.listing_status === 'Active'} /> Negotiable</label>
                        <UncontrolledTooltip target='listing-negotiable-label' placement='top'>Enabling this will allow your clients to send you offers.</UncontrolledTooltip>
                    </div>
                </div>

                Details:

                <textarea name='listing-detail' id='listing-detail' rows='10' className='form-control w-100 mb-3' placeholder='Describe the type of products or service you offer' onChange={(e) => this.setState({listing_detail: e.target.value})} value={this.state.listing_detail} disabled={this.state.listing_status === 'Active'}></textarea>
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