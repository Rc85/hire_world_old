import React, { Component } from 'react';
import '../../styles/Sectors.css';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from 'axios';
import Loading from '../utils/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import Alert from '../utils/Alert';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { GetSession } from '../../actions/FetchActions';

class Sectors extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sector: this.props.name,
            status: 'loading',
            listings: [],
            //openListForm: false,
            //title: null,
            //worldwide: false,
            //country: '',
            //region: '',
            //city: ''
        }
    }

    componentDidMount() {
        fetch.post('/api/get/services/listings', {sector: this.props.name})
        .then(resp => {
            if (resp.data.status === 'get listings success') {
                console.log(resp);
                this.setState({
                    status: 'success',
                    listings: resp.data.services
                });
            } else if (resp.data.status === 'get listings fail' || resp.data.status === 'get listings error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => console.log(err));
    }

    /* addListing() {
        let blankCheck = /^\s*$/;

        if (blankCheck.test(this.state.title) || this.state.title === null) {
            this.setState({status: 'blank title'});

            setTimeout(() => {
                this.setState({status: null});
            }, 2300);
        } else if (this.state.worldwide === false && blankCheck.test(this.state.country)) {
            this.setState({status: 'location required'});
        } else {
            fetch.post('/api/listings/add', {
                sector: this.state.sector,
                title: this.state.title,
                worldwide: this.state.worldwide,
                country: this.state.country,
                region: this.state.region,
                city: this.state.city
            })
            .then(resp => {
                console.log(resp);
                if (resp.data.status === 'not logged in') {
                    this.setState({status: 'not logged in'});
                } else if (resp.data.status === 'listing error' || resp.data.status === 'listing fail') {
                    this.setState({status: 'error'});
                } else if (resp.data.status === 'listing success') {
                    let listings = this.state.listings;
                    listings.unshift(resp.data.listing);

                    this.setState({
                        status: resp.data.status,
                        listings: listings,
                        openListForm: false
                    });

                    this.props.dispatch(GetSession());
                }
            })
            .catch(err => console.log(err));

            setTimeout(() => {
                this.setState({status: null});
            }, 2300);
        }
    } */

    render() {
        let loading, listForm, button, error;
        //let { country, region } = this.state;

        if (this.state.status === 'loading') {
            loading = <Loading size='5x' />
        } else if (this.state.status === 'error') {
            error = <Alert status='error' />
        } else if (this.state.status === 'blank title') {
            error = <Alert status='error' message='Title cannot be blank' />
        } else if (this.state.status === 'not logged in') {
            error = <Alert status='error' message={`You're not logged in`} />
        } else if (this.state.status === 'listing success') {
            error = <Alert status='success' message={`Listing successful`} />
        }

        /* if (this.props.user && this.props.user.user_listed < this.props.user.listings_allowed) {
            if (this.state.openListForm) {
                listForm = <div className='list-form rounded mb-3'>
                    <h4>List Your Portfolio</h4>

                    <label htmlFor='list-title'>Title:</label>
                    <input type='text' name='list-title' id='list-title' className='form-control mb-3' placeholder='Think of something unique and catchy'
                    onChange={(e) => {
                        this.setState({title: e.target.value});
                    }} />

                    <div className='region-container rounded mb-1'>
                        {this.state.status === 'location required' ? <div className='alert alert-danger'>Location required</div> : ''}
                        <small>This is where you will be listed. If you have an online business or a product that you sell internationally, select world-wide. If your business is conducted locally, then narrow down your location.</small>

                        <div><label htmlFor='worldwide'><input type='checkbox' name='worldwide' id='worldwide' className='form-checkbox mt-3'
                        onChange={() => {
                            this.setState({
                                worldwide: !this.state.worldwide,
                                country: '',
                                region: '',
                                city: ''
                            });
                        }} /> World-wide</label></div>
        
                        <label htmlFor='country'>Country:</label>
                        <CountryDropdown classes='form-control mb-1' value={country} onChange={(val) => this.setState({country: val})} disabled={this.state.worldwide ? true : false} />
        
                        <label htmlFor='region'>Region:</label>
                        <RegionDropdown classes='form-control mb-1' country={country} value={region} onChange={(val) => this.setState({region: val})} disabled={this.state.worldwide ? true : false} />
        
                        <label htmlFor='city'>City:</label>
                        <input type='text' name='city' id='city' className='form-control' onChange={(e) => {this.setState({city: e.target.value})}} disabled={this.state.worldwide ? true : false} />
                    </div>

                    <div className='text-right'>
                        <button className='btn btn-primary' onClick={this.addListing.bind(this)}>Submit</button>
                    </div>
                </div>;
                button = <button className='btn btn-info' title='Cancel' onClick={() => {
                    this.setState({
                        openListForm: false,
                        title: null,
                        worldwide: false,
                        country: '',
                        region: '',
                        city: ''
                    });
                }}><FontAwesomeIcon icon={faTimes} /></button>;
            } else {
                button = <button className='btn btn-info' title='List Your Portfolio' onClick={() => {
                    this.setState({openListForm: true});
                }}><FontAwesomeIcon icon={faPlus} /></button>;
            }
        } */

        let listings = this.state.listings.map((listing, i) => {
            return <div key={i} className='listing-row mb-2'>
                <div className='w-50'>{listing.service_name}</div>
                <div className='w-20'>{listing.service_provided_by}</div>
                <div className='w-20'>{listing.service_created_on}</div>
                <div className='w-10'></div>
            </div>
        })

        return(
            <section id='listings' className='main-panel w-100'>
                <div className='blue-panel shallow rounded'>
                    <h2 className='d-flex justify-content-between'>
                        {this.state.sector}

                        {button}
                    </h2>

                    {listForm}
                    {error}

                    <div className='listings-container'>
                        {loading}
                        <div className='listings-header'>
                            <div className='w-50'>Service</div>
                            <div className='w-20'>Provider</div>
                            <div className='w-20'>Posted Date</div>
                            <div className='w-10'>Rating</div>
                        </div>

                        <hr/>

                        {listings}
                    </div>
                </div>
            </section>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(Sectors));