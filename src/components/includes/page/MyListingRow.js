import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faSyncAlt, faTimes, faClock } from '@fortawesome/free-solid-svg-icons';
import SlideToggle from '../../utils/SlideToggle';
import ListSettings from './ListSettings';
import Tooltip from '../../utils/Tooltip';
import BusinessHoursSettings from './BusinessHoursSettings';

class MyListingRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            show: false
        }
    }

    toggle(value) {
        if (!this.state.show) {
            this.setState({show: value});
        } else {
            this.setState({show: false});
        }
    }
    
    render() {
        let now = new Date();
        let renewDate = new Date(this.props.listing.listing_renewed_date);
        let renewButton;

        if (now - renewDate > 8.64e+7) {
            renewButton = <Tooltip text='Renew Listing' placement='bottom-right' className='mr-2'><button className='btn btn-primary' onClick={() => this.props.renew(this.props.listing.listing_id)} disabled={this.props.status === 'Renewing'}><FontAwesomeIcon icon={faSyncAlt} /></button></Tooltip>;
        }

        return (
            <div className='my-listing-row'>
                <div className='my-listing-row-header'>
                    <div className='my-listing-row-title'><h5>{this.props.listing.listing_title}</h5></div>

                    <div className='my-listing-header-buttons'>
                        {renewButton}
                        <Tooltip text='List Settings' placement='bottom-right' className='mr-2'><button className='btn btn-info' onClick={() => this.toggle('settings')}><FontAwesomeIcon icon={this.state.show === 'settings' ? faTimes : faCogs} /></button></Tooltip>

                        {this.props.listing.listing_purpose === 'For Hire' ? <Tooltip text='Business Hours Settings' placement='bottom-right' className='mr-2'><button className='btn btn-info' onClick={() => this.toggle('hours')}><FontAwesomeIcon icon={this.state.show === 'hours' ? faTimes : faClock} /></button></Tooltip> : ''}

                        <SlideToggle status={this.props.listing.listing_status === 'Active'} onClick={() => this.props.toggleListing(this.props.listing.listing_id)} />
                    </div>
                </div>

                <div className={`my-listing-row-body`}>
                    {this.state.show === 'settings' ? <ListSettings listing={this.props.listing} /> : ''}
                    {this.state.show === 'hours' ? <BusinessHoursSettings hours={this.props.hours} id={this.props.listing.listing_id} /> : ''}
                </div>
            </div>
        );
    }
}

MyListingRow.propTypes = {
    listing: PropTypes.object,
    renew: PropTypes.func,
    status: PropTypes.string,
    toggleListing: PropTypes.func
};

export default MyListingRow;