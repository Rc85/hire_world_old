import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from 'axios';
import Loading from '../utils/Loading';
import { Alert } from '../../actions/AlertActions';
import ListingRow from '../includes/page/ListingRow';
import SearchListing from '../includes/page/SearchListing';
import { LogError } from '../utils/LogError';

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
            if (resp.data.status === 'success') {
                this.setState({status: '', listings: resp.data.listings});
            } else if (resp.data.status === 'access error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => LogError(err, '/api/get/listings'));
    }

    filterListings(data) {
        this.setState({status: 'Loading'});

        data['sector'] = this.props.name;

        fetch.post('/api/filter/listings', data)
        .then(resp => {
            this.setState({status: '', listings: resp.data.listings});

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/filter/listings'));
    }

    render() {
        let loading, button, error;

        if (this.state.status === 'loading') {
            loading = <Loading size='5x' />
        } else if (this.state.status === 'error') {
            error = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />
        }

        let listings = this.state.listings.map((listing, i) => {
            return <ListingRow key={i} listing={listing} />
        });

        if (this.state.status === 'access error') {
            return(<Response code={500} header='Internal Server Error' message={this.state.statusMessage} />)
        }

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
                            <div className='w-20'>Price</div>
                            <div className='w-15'>Completed Jobs</div>
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