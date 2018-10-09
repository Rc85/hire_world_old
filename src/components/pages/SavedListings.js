import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from '../utils/Loading';
import fetch from 'axios';
import ListingRow from '../includes/page/ListingRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ShowConfirmation, ResetConfirmation } from '../../actions/ConfirmationActions';
import { connect } from 'react-redux';
import { Alert } from '../../actions/Alert';
import { unsaveListing } from '../utils/Utils';

class SavedListings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: '',
            listings: []
        }

        this.selected = [];
    }
    
    componentDidMount() {
        this.setState({status: 'Loading'});

        fetch.post('/api/get/saved_listings')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listings: resp.data.listings});
            } else if (resp.data.status === 'error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data && nextProps.confirm.option) {
            if (nextProps.confirm.data.action === 'unsave selected') {
                this.unsaveSelectedListing();
                this.props.dispatch(ResetConfirmation());
            }
            
            if (nextProps.confirm.data.action === 'unsave listing') {
                this.unsave(nextProps.confirm.data.id);
                this.props.dispatch(ResetConfirmation());
            }
        }
    }
    

    selectRow(id, checked) {
        if (checked) {
            this.selected.push(id);
        } else {
            this.selected.splice(this.selected.indexOf(id), 1);
        }
    }

    selectAll() {
        let selectAllCheckbox = document.getElementById('select-all-checkbox');
        let rows = document.getElementsByClassName('listing-row-checkbox');

        if (selectAllCheckbox.checked) {
            for (let checkbox of rows) {
                checkbox.checked = true;
            }

            for (let listing of this.state.listings) {
                this.selected.push(listing.saved_id);
            }
        } else {
            for (let checkbox of rows) {
                checkbox.checked = false;
            }

            this.selected = [];
        }
    }

    unsaveSelectedListing() {
        if (this.selected.length === 0) {
            this.setState({status: 'error', statusMessage: 'Nothing to delete'});
        } else {
            this.setState({status: 'Loading'});

            fetch.post('/api/saved_listings/unsave', {listings: this.selected})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let status = resp.data.status;
                    let message = resp.data.statusMessage;

                    fetch.post('/api/get/saved_listings')
                    .then(resp => {
                        if (resp.data.status === 'success') {
                            let checkboxes = document.getElementsByClassName('listing-row-checkbox');

                            for (let checkbox of checkboxes) {
                                checkbox.checked = false;
                            }

                            this.setState({status: status, statusMessage: message, listings: resp.data.listings});
                        } else if (resp.data.status === 'error') {
                            this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                        }
                    });
                } else if (resp.data.status === 'error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => console.log(err));
        }
    }

    unsave(id) {
        this.setState({status: 'Loading'});

        unsaveListing(id, resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(Alert(resp.data.status, 'Listing deleted'));

                this.setState({status: resp.data.status, statusMessage: 'Listing deleted', listings: resp.data.listings});
            } else if (resp.data.status === 'error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        });
    }
    
    render() {
        let status, listings;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        listings = this.state.listings.map((listing, i) => {
            return <ListingRow key={i} listing={listing} selected={(checked) => this.selectRow(listing.saved_id, checked)} delete={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to delete this listing?`, false, {id: listing.saved_id, action: 'unsave listing'}))} editable />;
        })
        
        if (this.state.status === 'access error') {
            return(
                <Response code={500} header='Internal Server Error' message={this.state.statusMessage} />
            )
        }

        return(
            <section className='blue-panel three-rounded shallow'>
                {status}
                
                <div className='listings-header'>
                    <div className='w-5'><input id='select-all-checkbox' className='listing-row-checkbox' type='checkbox' onClick={() => this.selectAll()} /></div>
                    <div className='w-40'></div>
                    <div className='w-15'></div>
                    <div className='w-20'></div>
                    <div className='w-15'></div>
                    <div className='w-5 text-right'><button className='btn btn-secondary btn-sm' onClick={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to delete the selected listings?`, false, {action: 'unsave selected'}))}><FontAwesomeIcon icon={faTrash} /></button></div>
                </div>
                
                <hr/>

                {listings}
            </section>
        );
    }
}

SavedListings.propTypes = {
    user: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation,
        alerts: state.Alert.alerts
    }
}

export default connect(mapStateToProps)(SavedListings);