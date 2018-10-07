import React, { Component } from 'react';
import { withRouter, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from 'axios';
import Loading from '../utils/Loading';
import Alert from '../utils/Alert';
import UserRating from '../includes/page/UserRating';
import SearchListing from '../includes/page/SearchListing';

class Sectors extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sector: this.props.name,
            status: 'loading',
            statusMessage: '',
            listings: []
        }
    }

    componentDidMount() {
        fetch.post('/api/get/listings', {sector: this.props.name})
        .then(resp => {
            console.log(resp);
            if (resp.data.status === 'success') {
                this.setState({
                    status: 'success',
                    listings: resp.data.listings
                });
            } else if (resp.data.status === 'error') {
                this.setState({
                    status: resp.data.status,
                    statusMessage: resp.data.statusMessage
                });
            }
        })
        .catch(err => console.log(err));
    }

    filterListings(data) {
        console.log(data)
        this.setState({status: 'Loading'});

        data['sector'] = this.props.name;

        fetch.post('/api/filter/listings', data)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listings: resp.data.listings});
            } else if (resp.data.status === 'error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        });
    }

    render() {
        let loading, button, error;

        if (this.state.status === 'loading') {
            loading = <Loading size='5x' />
        } else if (this.state.status === 'error') {
            error = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />
        }

        let listings = this.state.listings.map((listing, i) => {
            return <div key={i} className='listing-row mb-2'>
                <div className='w-40 text-truncate'><NavLink to={`/listing/${listing.listing_id}`}>{listing.listing_title}</NavLink></div>
                <div className='w-15'><NavLink to={`/user/${listing.listing_user}`}>{listing.listing_user}</NavLink></div>
                <div className='w-20'>{listing.user_title}</div>
                <div className='w-15'>{listing.listing_created_date}</div>
                <div className='w-10 text-right'><UserRating rating={listing.rating} /></div>
            </div>
        })

        return(
            <section id='listings' className='main-panel w-100'>
                <SearchListing filter={(data) => this.filterListings(data)} />

                <div className='blue-panel shallow rounded'>
                    <h2 className='d-flex justify-content-between'>
                        {this.state.sector}

                        {button}
                    </h2>

                    {error}

                    <div className='listings-container'>
                        {loading}

                        <div className='listings-header mb-3'>
                            <div className='w-40'>Title</div>
                            <div className='w-15'></div>
                            <div className='w-20'></div>
                            <div className='w-15'>Posted Date</div>
                            <div className='w-10 text-right'>Rating</div>
                        </div>

                        <hr/>

                        {listings}
                    </div>
                </div>
            </section>
        )
    }
}

export default withRouter(connect()(Sectors));