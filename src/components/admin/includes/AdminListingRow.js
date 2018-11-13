import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import Menu from '../../utils/Menu';
import { ToggleMenu } from '../../../actions/MenuActions';
import { connect } from 'react-redux';
import fetch from 'axios';
import { NavLink } from 'react-router-dom';
import { Alert } from '../../../actions/AlertActions';
import { PromptOpen } from '../../../actions/PromptActions';


class AdminListingRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            listing: this.props.listing || {
                listing_created_date: '',
                listing_id: '',
                listing_renewed_date: '',
                listing_sector: '',
                listing_status: '',
                listing_title: '',
                listing_user: ''
            }
        }
    }
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.prompt.input && nextProps.prompt.data.action === 'delete listing' && nextProps.prompt.data.id === this.state.listing.listing_id) {
            this.changeStatus('Delete', nextProps.prompt.input);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.listing.listing_id !== this.props.listing.listing_id) {
            this.setState({listing: this.props.listing});
        }
    }
    
    toggleMenu() {
        if (this.props.menu.open !== 'admin') {
            this.props.dispatch(ToggleMenu('admin', '', this.state.listing.listing_id));
        } else if (this.props.menu.open === 'admin') {
            this.props.dispatch(ToggleMenu('', 'admin', this.state.listing.listing_id));
        }
    }

    handleMenuSelection(selection) {
        if (selection === 'Delete') {
            this.props.dispatch(PromptOpen('Please specify a reason for deleting this listing. This action cannot be reverted', {id: this.state.listing.listing_id, action: 'delete listing'}));
        } else {
            this.changeStatus(selection);
        }
    }

    changeStatus(status, reason) {
        this.setState({status: 'Sending'});

        fetch.post('/api/admin/listing/change-status', {id: this.state.listing.listing_id, status: status, reason: reason})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listing: resp.data.listing});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        if (this.state.listing) {
            let listingStatus, menu;

            if (this.state.listing.listing_status === 'Active') {
                listingStatus = <span className='badge badge-success'>{this.state.listing.listing_status}</span>;
            } else if (this.state.listing.listing_status === 'Inactive') {
                listingStatus = <span className='badge badge-secondary'>{this.state.listing.listing_status}</span>;
            } else if (this.state.listing.listing_status === 'Delete') {
                listingStatus = <span className='badge badge-danger'>{this.state.listing.listing_status}</span>;
            }

            if (this.props.menu.open === 'admin' && this.state.listing.listing_id === this.props.menu.id) {
                menu = <Menu items={['Active', 'Inactive', 'Delete']} onClick={(status) => this.handleMenuSelection(status)} />;
            }

            return (
                <div className='d-flex-between-center mb-3'>
                    <div className='w-5'>{this.state.listing.listing_id}</div>
                    <div className='w-35 text-truncate'><NavLink to={`/listing/${this.state.listing.listing_id}`}>{this.state.listing.listing_title}</NavLink></div>
                    <div className='w-15'><NavLink to={`/user/${this.state.listing.listing_user}`}>{this.state.listing.listing_user}</NavLink></div>
                    <div className='w-10'>{moment(this.state.listing.listing_created_date).format('MM-DD-YYYY')}</div>
                    <div className='w-15'>{moment(this.state.listing.listing_renewed_date).format('MM-DD-YYYY h:mm:ss') !== 'Invalid date' ? moment(this.state.listing.listing_renewed_date).format('MM-DD-YYYY h:mm:ss') : ''}</div>
                    <div className='w-10'>{this.state.listing.listing_sector}</div>
                    <div className='w-5'>{listingStatus}</div>
                    <div className='w-5 text-right position-relative'>
                        <button className='btn btn-info btn-sm admin-menu-button' onClick={() => this.toggleMenu()}>{this.props.menu.open === 'admin' ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}</button>
                        {menu}
                    </div>
                </div>
            );
        }

        return null;
    }
}

AdminListingRow.propTypes = {

};

const mapStateToProps = state => {
    return {
        menu: state.Menu,
        prompt: state.Prompt
    }
}

export default connect(mapStateToProps)(AdminListingRow);