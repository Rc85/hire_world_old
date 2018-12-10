import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import UserRating from './UserRating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

const ListingRow = props => {

    const selectRow = () => {
        let input = document.getElementById(`listing-${props.listing.saved_id}`);

        props.selected(input.checked);
    }

    return(
        <div className='listing-row mb-2'>
            {props.editable ? <div className='w-5'><input id={`listing-${props.listing.saved_id}`} className='listing-row-checkbox' type='checkbox' onClick={() => selectRow()} /></div> : ''}
            <div className='w-30 text-truncate' title={props.listing.listing_title}><NavLink to={`/user/${props.listing.listing_user}`}>{props.listing.listing_title}</NavLink></div>
            <div className='w-20 text-truncate'>{props.listing.listing_user}</div>
            <div className='w-20'>{props.editable ? '' : <span>${props.listing.listing_price} / {props.listing.listing_price_type} {props.listing.listing_price_currency}</span>}</div>
            <div className='w-10'>{props.editable ? '' : props.listing.job_complete}</div>
            <div className='w-10'>{props.editable ? '' : moment(props.listing.listing_created_date).format('MMM DD YYYY')}</div>
            {props.editable ? <div className='w-5 text-right'><button className='btn btn-secondary btn-sm' onClick={() => props.delete()}><FontAwesomeIcon icon={faTrash} /></button></div> : <div className='w-10 text-right'><UserRating rating={props.listing.rating} /></div>}
        </div>
    )
}

ListingRow.propTypes = {
    listing: PropTypes.object.isRequired
};

export default ListingRow;