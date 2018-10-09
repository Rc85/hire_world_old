import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';

class ListInfo extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showDetail: false
        }
    }
    
    render() {
        return(
            <div className='grey-panel rounded mb-3'>
                <h4><NavLink to={`/listing/${this.props.listing.listing_id}`}>{this.props.listing.listing_title}</NavLink></h4>

                <div><label>Listed Under:</label> {this.props.listing.listing_sector}</div>
                <div><label>Price Rate:</label> ${this.props.listing.listing_price} per {this.props.listing.listing_price_type} {this.props.listing.listing_price_currency}</div>
                <div><label>Negotiable:</label> {this.props.listing.listing_negotiable ? 'Yes' : 'No'}</div>

                <div>
                    <div><label>Detail:</label> <button className='btn btn-info btn-sm' onClick={() => this.setState({showDetail: !this.state.showDetail})}>{this.props.listing.showDetail ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}</button></div>
                    {this.state.showDetail ? <div className='bordered-container rounded mt-3'>{this.props.listing.listing_detail}</div> : ''}
                </div>
            </div>
        )
    }
}

ListInfo.propTypes = {
    listing: PropTypes.object.isRequired
}

export default ListInfo;