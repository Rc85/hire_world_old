import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SlideToggle from '../../utils/SlideToggle';
import fetch from 'axios';
import Loading from '../../utils/Loading';
import { Alert } from '../../../actions/AlertActions';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import { LogError } from '../../utils/LogError';
import { GetSectors } from '../../../actions/FetchActions';
import { UpdateUser } from '../../../actions/LoginActions';
import TitledContainer from '../../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
import RadioInput from '../../utils/RadioInput';
import InputWrapper from '../../utils/InputWrapper';
import TwoSidedCheckbox from '../../utils/TwoSidedCheckbox';
import TextArea from '../../utils/TextArea';
import SubmitButton from '../../utils/SubmitButton';
import { isTyping } from '../../../actions/ConfigActions';
import Tooltip from '../../utils/Tooltip';

class ListSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: '',
            showDetail: false,
            newSettings: {
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
            },
            initialSettings: {
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
    }
    
    componentDidMount() {
        this.props.dispatch(GetSectors());
        this.setState({status: 'Loading'});

        fetch.post('/api/get/listing')
        .then(resp => {
            if (resp.data.status === 'success') {
                let initialSettings = {...this.state.initialSettings, ...resp.data.listing};

                this.setState({status: '', initialSettings: initialSettings, newSettings: initialSettings});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/get/listing'));
    }

    saveSetting() {
        this.setState({status: 'Saving'});

        fetch.post('/api/listing/save', this.state.newSettings)
        .then(resp => {
            if (resp.data.status === 'success') {
                let initialSettings = {...this.state.newSettings, ...resp.data.listing};

                this.setState({status: '', initialSettings: initialSettings, newSettings: initialSettings});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/listing/save'));
    }
    
    toggleListing() {
        let status;

        if (this.props.user.user.listing_status === 'Active') {
            status = 'Inactive';
        } else if (this.props.user.user.listing_status === 'Inactive') {
            status = 'Active';
        }

        if (JSON.stringify(this.state.initialSettings) !== JSON.stringify(this.state.newSettings)) {
            this.props.dispatch(Alert('error', 'You must save your settings first'));
        } else {
            this.setState({status: 'Loading'});

            fetch.post('/api/listing/toggle', {status: status})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let user = {...this.props.user.user};
                    user.listing_status = resp.data.listing_status;

                    this.props.dispatch(UpdateUser(user));
                    this.setState({status: '', listing_status: resp.data.listing_status});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                }
            })
            .catch(err => LogError(err, '/api/listing/toggle'));
        }
    }

    renewListing() {
        this.setState({status: 'Loading'});

        fetch.post('/api/listing/renew', {listing_id: this.state.initialSettings.listing_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                let initialSettings = {...this.state.initialSettings};

                initialSettings.listing_renewed_date = resp.data.renewedDate;

                this.setState({status: '', initialSettings: initialSettings});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/listing/renew'));
    }

    setSetting(key, value) {
        let settings = {...this.state.newSettings}
        settings[key] = value;

        this.setState({newSettings: settings});
    }

    render() {
        let status, sectors, renewButton;

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

        if (this.state.initialSettings.listing_created_date) {
            let now = new Date();
            let lastRenew = new Date(this.state.initialSettings.listing_renewed_date);

            renewButton = <React.Fragment>
                <Tooltip text={now - lastRenew < 8.64e+7 ? 'You must wait 24 hours from your last renew before you can renew again' : 'Renewing your listing will bring it to the top of the list'} placement='bottom-right'><button id='renew-button' className='btn btn-primary ml-2' onClick={() => this.renewListing()} disabled={now - lastRenew < 8.64e+7}>Renew</button></Tooltip>
            </React.Fragment>;
        }
        
        let disableSave = JSON.stringify(this.state.initialSettings) === JSON.stringify(this.state.newSettings);

        return(
            <TitledContainer title='List Settings' bgColor='violet' shadow icon={<FontAwesomeIcon icon={faCogs} />}>
                <section id='list-settings'>
                    {status}
    
                    <div className='text-right mb-3'>{renewButton}</div>

                    <div className='mb-3'>
                        <div className='text-right'><small><span className='text-special'>*</span> <span className='text-light'><small><em>Required</em></small></span></small></div>
                        <RadioInput items={[
                            {text: 'I am looking for work', value: 'For Hire'},
                            {text: 'I am looking to hire', value: 'Hiring'}
                        ]} onClick={(val) => this.setSetting('listing_purpose', val)} disabled={this.props.user.user.listing_status === 'Active'} selected={this.state.initialSettings.listing_purpose} rows />
    
                        {/* <div><input type='radio' name='looking' value='For Hire' onClick={(e) => this.setState({listing_purpose: e.target.value})} disabled={this.state.listing_status === 'Active'} checked={this.state.listing_purpose === 'For Hire'} /> Looking for work</div>

                        <div><input type='radio' name='looking' value='Hiring' onClick={(e) => this.setState({listing_purpose: e.target.value})} disabled={this.state.listing_status === 'Active'} checked={this.state.listing_purpose === 'Hiring'} /> Looking to hire</div> */}
                    </div>
    
                    <div className='mb-3'>
                        <InputWrapper label='List Title' className={this.props.user.user.listing_status === 'Active' ? 'disabled' : ''} required>
                            <input type='text' value={this.state.newSettings.listing_title} disabled={this.props.user.user.listing_status === 'Active'} onChange={(e) => this.setSetting('listing_title', e.target.value)} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                        </InputWrapper>
                        {/* <label htmlFor='listing-title'>List Title: <span className='text-special'>*</span></label>
                        <input type='text' name='title' id='listing-title' onChange={(e) => this.setState({listing_title: e.target.value})} defaultValue={this.state.listing_title} disabled={this.state.listing_status === 'Active'} /> */}
                    </div>
    
                    <div className='mb-3'>
                        <InputWrapper label='List Under' className={this.props.user.user.listing_status === 'Active' ? 'disabled' : ''} required>
                            <select onChange={(e) => this.setSetting('listing_sector', e.target.value)} value={this.state.newSettings.listing_sector} disabled={this.props.user.user.listing_status === 'Active'}>{sectors}</select>
                        </InputWrapper>
                        {/* <label htmlFor='listing-sector'>List Under: <span className='text-special'>*</span></label>
                        <select name='sector' id='listing-sector' onChange={(e) => this.setState({listing_sector: e.target.value})} value={this.state.listing_sector} disabled={this.state.listing_status === 'Active'} >
                            {sectors}
                        </select> */}
                    </div>

                    <div className='setting-field-container mb-3'>
                        <InputWrapper label='Price Rate' id='listing-price' className={this.props.user.user.listing_status === 'Active' ? 'disabled' : ''}>
                            <input type='number' onChange={(e) => this.setSetting('listing_price', e.target.value)} value={this.state.newSettings.listing_price} disabled={this.props.user.user.listing_status === 'Active'} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                        </InputWrapper>
                        {/* <div id='list-setting-price'>

                            <label htmlFor='listing-price'>Price Rate: <span className='text-special'>*</span></label>
                            <input type='number' name='price' id='listing-price' onChange={(e) => this.setState({listing_price: e.target.value})} defaultValue={this.state.listing_price} disabled={this.state.listing_status === 'Active'} />
                        </div> */}

                        <InputWrapper label='Per' id='listing-price-type' className={this.props.user.user.listing_status === 'Active' ? 'disabled' : ''} required>
                            <select onChange={(e) => this.setSetting('listing_price_type', e.target.value)} value={this.state.newSettings.listing_price_type} disabled={this.props.user.user.listing_status === 'Active'}>
                                <option value='Hour'>Hour</option>
                                <option value='Bi-weekly'>Bi-weekly</option>
                                <option value='Month'>Month</option>
                                <option value='Delivery'>Delivery</option>
                                <option value='One Time Payment'>One Time Payment</option>
                            </select>
                        </InputWrapper>

                        <InputWrapper label='Currency' id='listing-price-currency' className={this.props.user.user.listing_status === 'Active' ? 'disabled' : ''} required>
                            <input type='text' onChange={(e) => this.setSetting('listing_price_currency', e.target.value)} value={this.state.newSettings.listing_price_currency} disabled={this.props.user.user.listing_status === 'Active'} list='currency-list' onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))} />
                            <datalist id='currency-list'>
                                <option value='USD'>USD</option>
                                <option value='CAD'>CAD</option>
                                <option value='AUD'>AUD</option>
                                <option value='EUR'>EUR</option>
                                <option value='GBP'>GBP</option>
                                <option value='CNY'>CNY</option>
                                <option value='JPY'>JPY</option>
                            </datalist>
                        </InputWrapper>

                        {/* <div id='list-setting-price-type'>
                            <label htmlFor='listing-price-type'>Per: <span className='text-special'>*</span></label>
                            <select name='listing-price-type' id='listing-price-type' onChange={(e) => this.setState({listing_price_type: e.target.value})} defaultValue={this.state.listing_price_type}  disabled={this.state.listing_status === 'Active'}>
                                <option value='Hour'>Hour</option>
                                <option value='Bi-weekly'>Bi-weekly</option>
                                <option value='Month'>Month</option>
                                <option value='Delivery'>Delivery</option>
                                <option value='One Time Payment'>One Time Payment</option>
                            </select>
                        </div>

                        <div id='list-setting-price-currency'>
                            <label htmlFor='listing-currency'>Currency: <span className='text-special'>*</span></label>
                            <input type='text' name='listing-currency' id='listing-currency' list='currency-list' maxLength='5' placeholder='Currency' onChange={(e) => this.setState({listing_price_currency: e.target.value})} defaultValue={this.state.listing_price_currency} disabled={this.state.listing_status === 'Active'} />
                            <datalist id='currency-list'>
                                <option value='USD'>USD</option>
                                <option value='CAD'>CAD</option>
                                <option value='AUD'>AUD</option>
                                <option value='EUR'>EUR</option>
                                <option value='GBP'>GBP</option>
                                <option value='CNY'>CNY</option>
                                <option value='JPY'>JPY</option>
                            </datalist>
                        </div> */}
                    </div>

                    <div className='d-flex-end-center mb-3'>
                        <TwoSidedCheckbox checkedText='Negotiable' uncheckedText='Non-negotiable' checked={this.state.newSettings.listing_negotiable} disabled={this.props.user.user.listing_status === 'Active'} check={(bool) => this.setSetting('listing_negotiable', bool)} />
                    </div>
                    {/* <label id='listing-negotiable-label' htmlFor='listing-negotiable'><input type='checkbox' name='listing-negotiable' id='listing-negotiable' onClick={() => this.setState({listing_negotiable: !this.state.listing_negotiable})} checked={this.state.listing_negotiable} disabled={this.state.listing_status === 'Active'} /> Negotiable</label>
                    <UncontrolledTooltip target='listing-negotiable-label' placement='top'>Enabling this will allow your clients to send you offers.</UncontrolledTooltip> */}

                    <TextArea label='Details' rows={10} className='mb-3' textAreaClassName='w-100' placeholder='Describe the type of products or service that you offer' onChange={(val) => this.setSetting('listing_detail', val)} value={this.state.newSettings.listing_detail} disabled={this.props.user.user.listing_status === 'Active'} />
                    
                    {/* Details:
    
                    <textarea name='listing-detail' id='listing-detail' rows='10'className='w-100 mb-3' placeholder='Describe the type of products or service you offer' onChange={(e) => this.setState({listing_detail: e.target.value})} value={this.state.listing_detail} disabled={this.state.listing_status === 'Active'}></textarea> */}

                    <div className='d-flex-end-center mb-3'>
                        {this.state.initialSettings.listing_status ? <div className='mr-1'><SlideToggle status={new Date(this.props.user.user.subscription_end_date) > new Date() && this.props.user.user.listing_status === 'Active'} onClick={() => this.toggleListing()} /></div> : ''}

                        <SubmitButton type='button' loading={this.state.status === 'Saving'} onClick={() => this.saveSetting()} value='Save' disabled={disableSave} />

                        <button className='btn btn-secondary' onClick={() => this.setState({newSettings: this.state.initialSettings})}>Reset</button>
                    </div>
                </section>
            </TitledContainer>
        );
    }
}

ListSettings.propTypes = {
    user: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return {
        sectors: state.Sectors.sectors
    }
}

export default withRouter(connect(mapStateToProps)(ListSettings));