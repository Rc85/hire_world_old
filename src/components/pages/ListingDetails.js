import React, { Component } from 'react';
import { withRouter, NavLink } from 'react-router-dom';
import Loading from '../utils/Loading';
import fetch from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHeart, faUserCircle, faDollarSign, faHandHoldingUsd, faAt, faPhone, faMapMarkerAlt, faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons';
import MessageSender from '../includes/page/MessageSender';
import { unsaveListing } from '../utils/Utils';
import { Alert } from '../../actions/AlertActions';
import { connect } from 'react-redux';
import moment from 'moment';
import { UncontrolledTooltip } from 'reactstrap';
import UserRating from '../includes/page/UserRating';
import { faListAlt, faBuilding, faIdBadge } from '@fortawesome/free-regular-svg-icons';
import { LogError } from '../utils/LogError';

class ListingDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            listing: null,
            status: 'Loading',
            statusMessage: '',
            listingSaved: false,
            listingReported: false,
            rating: 0
        }
    }

    componentDidMount() {
        fetch.post('/api/get/listing/detail', {id: this.props.match.params.id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listing: resp.data.listing, listingSaved: resp.data.saved, listingReported: resp.data.reported, rating: resp.data.rating});
            } else if (resp.data.status === 'access error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => LogError(err, '/api/get/listing/detail'));
    }

    send(message, subject) {
        this.setState({status: 'Sending'});

        fetch.post('/api/conversation/submit', {subject: subject, message: message, listing: this.state.listing})
        .then(resp => {
            this.setState({status: resp.data.status});

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/conversation/submit'));
    }

    saveListing() {
        this.setState({status: 'Sending'});

        fetch.post('/api/listing/save', this.state.listing)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listingSaved: true});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/listing/save'));
    }

    unsave(id) {
        this.setState({status: 'Sending'});

        unsaveListing(id, resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listingSaved: false});
            } else {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        });
    }

    submitReport() {
        this.setState({status: 'Sending'});

        fetch.post('/api/report/submit', {id: this.state.listing.listing_id, type: 'Listing', url: this.props.location.pathname, user: this.state.listing.listing_user})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listingReported: true});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/report/submit'));
    }

    render() {
        let inquire, status, footer, savedIcon, reportIcon;

        if (this.props.user.user && this.state.listing && this.props.user.user.username !== this.state.listing.listing_user) {
            if (this.state.listing.allow_messaging) {
                inquire = <div>
                    <hr/>

                    <MessageSender send={(message, subject) => this.send(message, subject)} status={this.state.status} withSubject />
                </div>;
            }
        }

        if (this.state.status === 'Sending') {
            status = <Loading size='5x' />;
        }

        if (this.state.listing && this.props.user.user && this.state.listing.listing_user !== this.props.user.user.username) {
            if (!this.state.listingReported) {
                reportIcon = <FontAwesomeIcon icon={faExclamationTriangle} size='sm' className='menu-button' onClick={() => this.submitReport()} />;
            } else {
                reportIcon = <span>
                    <FontAwesomeIcon icon={faExclamationTriangle} size='sm' className='theme-bg' id='report-icon' />
                    <UncontrolledTooltip placement='top' target='report-icon'>Already reported</UncontrolledTooltip>
                </span>;
            }
        }
        
        if (this.props.user.user && this.state.listing && this.state.listing.listing_user !== this.props.user.user.username) {
            if (this.state.listingSaved) {
                savedIcon = <FontAwesomeIcon icon={faHeart} size='sm' className='menu-button' color='#ffc107' onClick={() => this.unsave(this.state.listing.saved_id)} />;
            } else {
                savedIcon = <FontAwesomeIcon icon={faHeart} size='sm' className='menu-button' onClick={() => this.saveListing()} />;
            }

            footer = <div className='listing-footer'>
                <hr/>

                <div className='d-flex-between-center'>
                    <div>{savedIcon} {reportIcon}</div>
                    <small className='theme-medgrey'>Listing ID: {this.state.listing.listing_id}</small>
                </div>
            </div>;
        }

        if (this.state.status === 'access error') {
            return <Redirect to='/error/app/500' />
        } else if (this.state.status === 'Loading') {
            return <Loading size='7x' />
        } else {
            return(
                <section id='listing-details' className='main-panel w-100'>
                    {status}
                    <div className='blue-panel shallow rounded w-100 position-relative'>
                        <div className='service-details-header'>
                            <h2>{this.state.listing.listing_title}</h2>
                            
                            <span>Listed on {moment(this.state.listing.listing_created_date).format('MMM DD YYYY')} {this.state.listing.listing_renewed_date ? <span>(Renewed on {moment(this.state.listing.listing_renewed_date).format('MMM DD YYYY')})</span> : ''}</span>
                        </div>

                        <hr/>

                        <div className='row'>
                            <div className='col-8'>
                                <div className='rounded'>
                                    {this.state.listing.listing_detail}
                                </div>
                            </div>

                            <div className='col-4'>
                                {this.state.listing.user_business_name ? <div className='d-flex'><div className='w-35'><FontAwesomeIcon icon={faBuilding} className='view-user-icon mr-2' /><strong>Business Name: </strong></div>{this.state.listing.user_business_name}</div> : ''}
                                <div className='d-flex'><div className='w-35'><FontAwesomeIcon icon={faUserCircle} className='view-user-icon mr-2' /><strong>User:</strong></div> <div className='mr-2'>{this.state.listing.listing_user}</div> <UserRating rating={this.state.rating} /></div>
                                <div className='d-flex'><div className='w-35'><FontAwesomeIcon icon={faIdBadge} className='view-user-icon mr-2' /><strong>Profession Title:</strong></div>{this.state.listing.user_title}</div>

                                <hr/>

                                <div className='d-flex'><div className='w-35'><FontAwesomeIcon icon={faListAlt} className='view-user-icon mr-2' /><strong>Listed Under:</strong></div> <NavLink to={`/sectors/${this.state.listing.listing_sector}`}>{this.state.listing.listing_sector}</NavLink></div>
                                <div className='d-flex'><div className='w-35'><FontAwesomeIcon icon={faDollarSign} className='view-user-icon mr-2' /><strong>Asking Price:</strong></div> ${this.state.listing.listing_price} per {this.state.listing.listing_price_type} {this.state.listing.listing_price_currency}</div>
                                <div className='d-flex'><div className='w-35'><FontAwesomeIcon icon={faHandHoldingUsd} className='view-user-icon mr-2' /><strong>Negotiable: </strong></div> {this.state.listing.listing_negotiable ? 'Yes' : 'No'}</div>

                                <hr/>

                                {this.state.listing.user_email ? <div className='d-flex'><div className='w-35'><FontAwesomeIcon icon={faAt} className='view-user-icon mr-2' /><strong>Email: </strong></div> <a href={`mailto:${this.state.listing.user_email}`}>{this.state.listing.user_email}</a></div> : ''}
                                {this.state.listing.user_phone ? <div className='d-flex'><div className='w-35'><FontAwesomeIcon icon={faPhone} /><strong>Phone Number:</strong></div> {this.state.listing.user_phone}</div> : ''}
                                {this.state.listing.user_address ? <div className='d-flex'><div className='w-35'><FontAwesomeIcon icon={faMapMarkedAlt} className='view-user-icon mr-2' /><strong>Address: </strong></div> <div className='keep-formatting'>{this.state.listing.user_address}{this.state.listing.user_city_code ? <span>, {this.state.listing.user_city_code}</span> : ''}</div></div> : ''}
                                {this.state.listing.user_city && this.state.listing.user_region && this.state.listing.user_country ? <div className='d-flex'><div className='w-35'><FontAwesomeIcon icon={faMapMarkerAlt} className='view-user-icon mr-2' /><strong>Location:</strong></div> <span>{this.state.listing.user_city}, {this.state.listing.user_region}, {this.state.listing.user_country}</span></div> : ''}

                                {inquire}
                            </div>
                        </div>

                        {footer}
                    </div>
                </section>
            )
        }
    }
}

export default withRouter(connect()(ListingDetails));