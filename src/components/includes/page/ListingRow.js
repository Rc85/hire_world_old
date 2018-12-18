import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import UserRating from './UserRating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import UserProfilePic from '../page/UserProfilePic';

const ListingRow = props => {
    console.log(props.listing)
    const selectRow = () => {
        let input = document.getElementById(`listing-${props.listing.saved_id}`);

        props.selected(input.checked);
    }

    return(
        <div className='mb-3'>
            <div className='d-flex-between-start'>
                <div className='w-3'><UserProfilePic url={props.listing.avatar_url} /></div>

                <div className='w-96'>
                    <div className='d-flex-between-start'>
                        {props.editable ? <div className='w-5'><input id={`listing-${props.listing.saved_id}`} className='listing-row-checkbox' type='checkbox' onClick={() => selectRow()} /></div> : ''}
                        <div className='w-90 text-truncate' title={props.listing.listing_title}><NavLink to={`/user/${props.listing.listing_user}`}>{props.listing.listing_title}</NavLink></div>
                        {props.editable ? <div className='w-5 text-right'><button className='btn btn-secondary btn-sm' onClick={() => props.delete()}><FontAwesomeIcon icon={faTrash} /></button></div> : <div className='w-10 text-right'><UserRating rating={props.listing.rating} /></div>}
                    </div>
        
                    <div className='d-flex-between-start'>
                        <div className='w-25 text-truncate'><small>{props.listing.listing_user} ({props.listing.user_title})</small></div>
                        <div className='w-25'>{props.editable ? '' : <small>${props.listing.listing_price} / {props.listing.listing_price_type} {props.listing.listing_price_currency} {props.listing.listing_negotiable ? <span className='badge badge-primary'>Negotiable</span> : ''}</small>}</div>
                        <div className='w-25 text-right'>{props.editable ? '' : <small>{props.listing.job_complete} Jobs Completed</small>}</div>
                        <div className='w-25 text-right'>{props.editable ? '' : <small>{moment(props.listing.listing_created_date).format('MMM DD YYYY')}</small>}</div>
                    </div>
                </div>
            </div>

            <hr className='theme-medgrey-bg mb-0 mt-0'/>
        </div>
    )
}

ListingRow.propTypes = {
    listing: PropTypes.object.isRequired
};

export default ListingRow;