import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from 'axios';
import { Alert } from '../../actions/AlertActions';
import ListingRow from '../includes/page/ListingRow';
import SearchListing from '../includes/page/SearchListing';
import { LogError } from '../utils/LogError';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThList } from '@fortawesome/free-solid-svg-icons';
import Loading from '../utils/Loading';

class Sectors extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: 'Loading',
            statusMessage: '',
            totalListings: 0,
            listings: [],
            offset: 0
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.key !== this.props.location.key) {
            this.setState({status: 'Loading'});

            fetch.post('/api/get/listings', {sector: this.props.match.params.sector})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', listings: resp.data.listings});
                } else if (resp.data.status === 'access error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => LogError(err, '/api/get/listings'));
        }

        if (prevState.offset !== this.state.offset) {
            this.setState({status: 'Loading'});

            fetch.post('/api/get/listings', {sector: this.props.match.params.sector, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let listings = [...this.state.listings, ...resp.data.listings];

                    this.setState({status: '', listings: listings});
                } else if (resp.data.status === 'access error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => LogError(err, '/api/get/listings'));
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/listings', {sector: this.props.match.params.sector})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listings: resp.data.listings, totalListings: parseInt(resp.data.totalListings )});
            } else if (resp.data.status === 'access error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => LogError(err, '/api/get/listings'));
    }

    filterListings(data) {
        this.setState({status: 'Loading'});

        data['sector'] = this.props.match.params.sector;

        fetch.post('/api/filter/listings', data)
        .then(resp => {
            this.setState({status: '', listings: resp.data.listings, totalListings: parseInt(resp.data.totalListings)});

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/filter/listings'));
    }

    render() {
        let status;

        let listings = this.state.listings.map((listing, i) => {
            return <ListingRow key={i} listing={listing} />
        });

        if (this.state.status === 'access error') {
            return <Redirect to='/error/app/500' />
        } else if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        return(
            <React.Fragment>
                <SearchListing filter={(data) => this.filterListings(data)} status={this.state.status} />

                {status}
                
                <section id='listings' className='main-panel'>
                    <TitledContainer title={this.props.match.params.sector} bgColor='primary' icon={<FontAwesomeIcon icon={faThList} />}shadow >
                        <div className='listings-container'>
                            {listings}
                        </div>

                        {this.state.totalListings > 25 ? <div className='text-center'><button className='btn btn-primary btn-sm' onClick={() => this.setState({offset: this.state.offset + 25})}>Load more</button></div> : ''}
                    </TitledContainer>
                </section>
            </React.Fragment>
        )
    }
}

export default withRouter(connect()(Sectors));