import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from 'axios';
import { Alert } from '../../actions/AlertActions';
import ListingRow from '../includes/page/ListingRow';
import FilterListings from '../includes/page/FilterListings';
import { LogError } from '../utils/LogError';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThList } from '@fortawesome/pro-solid-svg-icons';
import Loading from '../utils/Loading';
import PostedJobRow from '../includes/page/PostedJobRow';

class Sectors extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: 'Loading',
            statusMessage: '',
            totalListings: 0,
            listings: [],
            offset: 0,
            filter: null
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.key !== this.props.location.key) {
            this.setState({status: 'Loading'});

            fetch.post('/api/get/listings', {sector: this.props.match.params.sector, type: this.props.match.params.type})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', listings: resp.data.listings});
                } else if (resp.data.status === 'access error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                } else if (resp.data.status === 'error') {
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                    this.setState({status: ''});
                }
            })
            .catch(err => {
                LogError(err, '/api/get/listings');
                this.setState({status: ''});
            });
        }

        if (prevState.offset !== this.state.offset || prevState.filter !== this.state.filter) {
            this.setState({status: 'Loading'});

            fetch.post('/api/get/listings', {sector: this.props.match.params.sector, offset: this.state.offset, type: this.props.match.params.type, filter: this.state.filter})
            .then(resp => {
                if (resp.data.status === 'success') {
                    let listings;
                    
                    if (prevState.offset !== this.state.offset) {
                        listings = [...this.state.listings, ...resp.data.listings];
                    } else if (prevState.filter !== this.state.filter) {
                        listings = resp.data.listings;
                    }

                    this.setState({status: '', listings: listings});
                } else if (resp.data.status === 'access error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                } else if (resp.data.status === 'error') {
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                    this.setState({status: ''});
                }
            })
            .catch(err => {
                LogError(err, '/api/get/listings');
                this.setState({status: ''});
            });
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/listings', {sector: this.props.match.params.sector, type: this.props.match.params.type})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listings: resp.data.listings, totalListings: parseInt(resp.data.totalListings )});
            } else if (resp.data.status === 'access error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            } else if (resp.data.status === 'error') {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                this.setState({status: ''});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/listings');
            this.setState({status: ''});
        });
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
        let listings;
        
        if (this.props.match.params.type === 'profiles') {
            listings = this.state.listings.map((listing, i) => {
                return <ListingRow key={listing.listing_id} listing={listing} />
            });
        } else if (this.props.match.params.type === 'jobs') {
            listings = this.state.listings.map((job, i) => {
                return <PostedJobRow key={job.job_post_id} job={job} user={this.props.user} />
            });
        }

        if (this.state.status === 'access error') {
            return <Redirect to='/error/app/500' />
        } else if (this.state.status === 'Loading') {
            return <Loading size='7x' color='black' />;
        }

        return(
            <React.Fragment>
                <FilterListings filter={(data) => this.setState({filter: data})} status={this.state.status} type={this.props.match.params.type} />
                
                <section id='listings' className='main-panel mt-5'>
                    <TitledContainer title={this.props.match.params.type.charAt(0).toUpperCase() + this.props.match.params.type.substr(1)} secondaryTitle={this.props.match.params.sector} bgColor='primary' icon={<FontAwesomeIcon icon={faThList} />}shadow >
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