import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'axios';
import Loading from '../utils/Loading';
import { Alert } from '../../actions/AlertActions';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import { LogError } from '../utils/LogError';
import InputWrapper from '../utils/InputWrapper';
import TwoSidedCheckbox from '../utils/TwoSidedCheckbox';
import TextArea from '../utils/TextArea';
import SubmitButton from '../utils/SubmitButton';
import { IsTyping } from '../../actions/ConfigActions';
import Tooltip from '../utils/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircleNotch, faUser } from '@fortawesome/pro-solid-svg-icons';
import TitledContainer from '../utils/TitledContainer';
import { faListAlt } from '@fortawesome/pro-regular-svg-icons';
import SlideToggle from '../utils/SlideToggle';
import { UpdateUser } from '../../actions/LoginActions';
import BusinessHoursSettings from '../includes/page/BusinessHoursSettings';
import StaticAlert from '../utils/StaticAlert';

class Profile extends Component {
    constructor(props) {
        super(props);

        this.clearSettings = {
            listing_negotiable: false,
            listing_price_type: 'To Be Discussed',
            listing_id: null,
            listing_renewed_date: null,
            listing_created_date: null,
            listing_sector: 'Agencies',
            listing_price: '',
            listing_price_currency: '',
            listing_detail: '',
            listing_status: '',
            listing_title: '',
            listing_purpose: '',
            listing_location: '',
            listing_local: false,
            listing_remote: false
        };
        
        this.state = {
            status: 'Loading',
            statusMessage: '',
            showDetail: false,
            newSettings: {
                listing_negotiable: false,
                listing_price_type: 'To Be Discussed',
                listing_id: null,
                listing_renewed_date: null,
                listing_created_date: null,
                listing_sector: 'Agencies',
                listing_price: '',
                listing_price_currency: '',
                listing_detail: '',
                listing_status: '',
                listing_title: '',
                listing_purpose: '',
                listing_local: false,
                listing_remote: false
            },
            initialSettings: {
                listing_negotiable: false,
                listing_price_type: 'To Be Discussed',
                listing_id: null,
                listing_renewed_date: null,
                listing_created_date: null,
                listing_sector: 'Agencies',
                listing_price: '',
                listing_price_currency: '',
                listing_detail: '',
                listing_status: '',
                listing_title: '',
                listing_purpose: '',
                listing_location: '',
                listing_local: false,
                listing_remote: false
            }
        }
    }

    componentDidMount() {
        fetch.post('/api/get/listing')
        .then(resp => {
            if (resp.data.status === 'success') {
                let initialSettings = {...this.state.initialSettings, ...resp.data.listing};

                this.setState({status: '', initialSettings: initialSettings, newSettings: initialSettings});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/listing');
            this.setState({status: ''});
        });
    }

    saveSetting() {
        this.setState({status: 'Saving'});

        fetch.post('/api/listing/save', this.state.newSettings)
        .then(resp => {
            if (resp.data.status === 'success') {
                let initialSettings = {...this.state.newSettings, ...resp.data.listing};
                let user = {...this.props.user.user};
                user.listing_status = resp.data.listing.listing_status;

                this.props.dispatch(UpdateUser(user));
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
            this.setState({status: 'Toggling'});

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

    setSetting(key, value) {
        let settings = {...this.state.newSettings}
        settings[key] = value;

        this.setState({newSettings: settings});
    }

    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/' />;
        }

        if (this.props.user.user) {
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
                    <Tooltip text={now - lastRenew < 8.64e+7 ? 'You must wait 24 hours from your last renew before you can renew again' : 'Renewing your listing will bring it to the top of the list'} placement='bottom-right' className='mr-1'><button id='renew-button' className='btn btn-primary' onClick={() => this.renewListing()} disabled={now - lastRenew < 8.64e+7}>Renew</button></Tooltip>
                </React.Fragment>;
            }
            
            let disableSave = JSON.stringify(this.state.initialSettings) === JSON.stringify(this.state.newSettings);

            return(
                <section id='list-settings' className='main-panel'>
                    <TitledContainer title='Profile' bgColor='danger' icon={<FontAwesomeIcon icon={faUser} />} shadow>
                        {status}

                        <div className='setting-container'>
                            <div className='list-setting-container'>
                                <div className='d-flex-end-center mb-3'>
                                    <div className='d-flex-center-center mr-1'>
                                        {this.state.status === 'Toggling' ? <FontAwesomeIcon icon={faCircleNotch} spin className='mr-1' /> : ''}
                                        <SlideToggle status={this.props.user.user.listing_status === 'Active'} onClick={() => this.toggleListing()} />
                                    </div>

                                    {renewButton}
                                </div>
        
                                <form onSubmit={e => {
                                    e.preventDefault();
                                    
                                    this.saveSetting();
                                }}>
                                    <div className='setting-field-container mb-3'>
                                        <InputWrapper label='List Title' id='listing-title' required>
                                            <input type='text' value={this.state.newSettings.listing_title} onChange={(e) => this.setSetting('listing_title', e.target.value)} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} maxLength='60' placeholder='60 characters max' />
                                        </InputWrapper>
            
                                        <InputWrapper label='Type of Business' id='listing-location' required>
                                            <div className='checkbox-label-container'>
                                                <label className={`checkbox-label ${this.state.newSettings.listing_online ? 'active' : ''} ${this.state.onlineFocused ? 'hovered' : ''}`}>
                                                    <input type='checkbox' value='Online' onChange={(e) => this.setSetting('listing_online', !this.state.newSettings.listing_online)} checked={this.state.newSettings.Listing_online} onFocus={() => this.setState({onlineFocused: true})} onBlur={() => this.setState({onlineFocused: false})} />
                                                    
                                                    <div className='checkbox-container'>
                                                        <div className='checkbox'>{this.state.newSettings.listing_online ? <FontAwesomeIcon icon={faCheck} /> : ''}</div>
                                                        <span className='checkbox-label-text'>Connect</span>
                                                    </div>
                                                </label>

                                                <label className={`checkbox-label ${this.state.newSettings.listing_remote ? 'active' : ''} ${this.state.remoteFocused ? 'hovered' : ''}`}>
                                                    <input type='checkbox' value='Remote' onChange={(e) => this.setSetting('listing_remote', !this.state.newSettings.listing_remote)} checked={this.state.newSettings.listing_remote} onFocus={() => this.setState({remoteFocused: true})} onBlur={() => this.setState({remoteFocused: false})} />
                                                    
                                                    <div className='checkbox-container'>
                                                        <div className='checkbox'>{this.state.newSettings.listing_remote ? <FontAwesomeIcon icon={faCheck} /> : ''}</div>
                                                        <span className='checkbox-label-text'>Remote</span>
                                                    </div>
                                                </label>
                        
                                                <label className={`checkbox-label ${this.state.newSettings.listing_local ? 'active' : ''} ${this.state.localFocused ? 'hovered' : ''}`}>
                                                    <input type='checkbox' value='Local' onChange={(e) => this.setSetting('listing_local', !this.state.newSettings.listing_local)} checked={this.state.newSettings.listing_local} onFocus={() => this.setState({localFocused: true})} onBlur={() => this.setState({localFocused: false})} />
                                                    
                                                    <div className='checkbox-container'>
                                                        <div className='checkbox'>{this.state.newSettings.listing_local ? <FontAwesomeIcon icon={faCheck} /> : ''}</div>
                                                        <span className='checkbox-label-text'>Local</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </InputWrapper>
                                    </div>
                        
                                    <div className='mb-3'>
                                        <InputWrapper label='List Sector' required>
                                            <select onChange={(e) => this.setSetting('listing_sector', e.target.value)} value={this.state.newSettings.listing_sector}>{sectors}</select>
                                        </InputWrapper>
                                    </div>
                        
                                    <div className='setting-field-container mb-3'>
                                        <InputWrapper label='Pay Frequency' id='listing-price-type' required>
                                            <select onChange={(e) => this.setSetting('listing_price_type', e.target.value)} value={this.state.newSettings.listing_price_type}>
                                                <option value='To Be Discussed'>To Be Discussed</option>
                                                <option value='Hourly'>Hourly</option>
                                                <option value='Bi-weekly'>Bi-weekly</option>
                                                <option value='Monthly'>Monthly</option>
                                                <option value='Per Delivery'>Per Delivery</option>
                                                <option value='One Time Payment'>One Time Payment</option>
                                            </select>
                                        </InputWrapper>
                        
                                        {this.state.newSettings.listing_price_type !== 'To Be Discussed' ? <React.Fragment>
                                            <InputWrapper label='Price Rate' id='listing-price'>
                                                <input type='number' onChange={(e) => this.setSetting('listing_price', e.target.value)} value={this.state.newSettings.listing_price} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                                            </InputWrapper>
                            
                                            <InputWrapper label='Currency' id='listing-price-currency' required>
                                                <input type='text' onChange={(e) => this.setSetting('listing_price_currency', e.target.value)} value={this.state.newSettings.listing_price_currency} list='currency-list' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                                                <datalist id='currency-list'>
                                                    <option value='USD'>USD</option>
                                                    <option value='CAD'>CAD</option>
                                                    <option value='AUD'>AUD</option>
                                                    <option value='EUR'>EUR</option>
                                                    <option value='GBP'>GBP</option>
                                                </datalist>
                                            </InputWrapper>
                                        </React.Fragment> : ''}
                                    </div>
                        
                                    <div className='d-flex-end-center mb-3'>
                                        <TwoSidedCheckbox checkedText='Negotiable' uncheckedText='Non-negotiable' checked={this.state.newSettings.listing_negotiable} check={(bool) => this.setSetting('listing_negotiable', bool)} />
                                    </div>
                        
                                    <TextArea label='Details' rows={10} className='mb-3' textAreaClassName='w-100' onChange={(val) => this.setSetting('listing_detail', val)} value={this.state.newSettings.listing_detail} />
            
                                    <div className='d-flex-end-center mb-3'>
                                        {this.props.create ? <SubmitButton type='submit' loading={this.props.status === 'Creating'} value='Create' /> : <SubmitButton type='submit' loading={this.state.status === 'Saving'} value='Save' disabled={disableSave} />}
                                        <button type='button' className='btn btn-secondary' onClick={() => this.setState({newSettings: this.clearSettings})}>Clear</button>
                                        <button type='button' className='btn btn-secondary' onClick={() => this.setState({newSettings: this.state.initialSettings})}>Reset</button>
                                    </div>
                                </form>
                            </div>

                            <div className='business-hours-setting-container'><BusinessHoursSettings id={this.state.newSettings.listing_id} /></div>
                        </div>
                    </TitledContainer>
                </section>
            );
        }
        
        return <Loading size='7x' color='black' />;
    }
}

Profile.propTypes = {
    user: PropTypes.object
};

export default withRouter(connect()(Profile));