import React, { Component } from 'react';
import { withRouter, Redirect, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from 'axios';
import { Alert } from '../actions/AlertActions';
import FilterListings from '../components/FilterListings';
import { LogError } from '../components/utils/LogError';
import TitledContainer from '../components/utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThList, faUserCircle, faCalendarAlt, faSackDollar } from '@fortawesome/pro-solid-svg-icons';
import Loading from '../components/utils/Loading';
import Row from '../components/Row';
import Username from '../components/Username';
import moment from 'moment';
import MoneyFormatter from '../components/utils/MoneyFormatter';
import UserRating from '../components/UserRating';

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
                let price, local, remote, online;

                if (listing.listing_local) {
                    local = <span className='mini-badge mini-badge-orange mr-1'>Local</span>;
                }

                if (listing.listing_remote) {
                    remote = <span className='mini-badge mini-badge-green'>Remote</span>;
                }

                if (listing.listing_online) {
                    online = <span className='mini-badge mini-badge-purple mr-1'>Online</span>;
                }

                if (listing.listing_price_type === 'To Be Discussed') {
                    price = listing.listing_price_type;
                } else {
                    if (listing.listing_price !== '0') {
                        price = <span>$<MoneyFormatter value={listing.listing_price} /> / {listing.listing_price_type} {listing.listing_price_currency}</span>;
                    }
                }

                return <Row
                key={listing.listing_id}
                index={i}
                title={
                    <React.Fragment>
                        <NavLink to={`/user/${listing.listing_user}`}>{listing.listing_title}</NavLink>
                    </React.Fragment>
                }
                details={
                    <React.Fragment>
                        <div className='row-detail'><FontAwesomeIcon icon={faUserCircle} className='text-special mr-1' /> <Username username={listing.listing_user} color='alt-highlight' /> {listing.link_work_acct_status === 'Approved' && new Date(listing.subscription_end_date) >= new Date() ? <div className='linked-status mini-badge mini-badge-success ml-1'>Linked</div> : ''}</div>
                        <div className='row-detail'>({listing.user_title})</div>
                        <div className='row-detail'><FontAwesomeIcon icon={faCalendarAlt} className='text-special mr-1' /> {moment(listing.listing_created_date).format('MM-DD-YYYY')}</div>
                        <div className='row-detail'><FontAwesomeIcon icon={faSackDollar} className='text-special mr-1' /> {price}</div>
                        <div className='row-detail'>{local} {online} {remote}</div>
                    </React.Fragment>
                }
                buttons={
                    <React.Fragment>
                        <UserRating rating={listing.rating} /> <span>({listing.review_count ? listing.review_count : 0})</span>
                    </React.Fragment>
                }
                />
            });
        } else if (this.props.match.params.type === 'jobs') {
            listings = this.state.listings.map((job, i) => {
                //return <PostedJobRow key={job.job_post_id} job={job} user={this.props.user} />

                let local, remote, online, budget;

                if (job.job_is_local) {
                    local = <span className='mini-badge mini-badge-orange mr-1'>Local</span>;
                }

                if (job.job_is_remote) {
                    remote = <span className='mini-badge mini-badge-green'>Remote</span>;
                }

                if (job.job_is_online) {
                    online = <span className='mini-badge mini-badge-purple mr-1'>Online</span>;
                }

                if (job.job_post_budget_threshold === 'Between') {
                    budget = <span>$<MoneyFormatter value={job.job_post_budget} /> to $<MoneyFormatter value={job.job_post_budget_end} /></span>;
                } else if (job.job_post_budget_threshold === 'Approximately') {
                    budget = <span>{job.job_post_budget_threshold} $<MoneyFormatter value={job.job_post_budget} /></span>;
                } else if (job.job_post_budget_threshold === 'Exactly') {
                    budget = <span>$<MoneyFormatter value={job.job_post_budget} /></span>;
                } else if (job.job_post_budget_threshold === 'To Be Discussed') {
                    budget = 'To Be Discussed';
                }

                return <Row
                key={job.job_post_id}
                index={i}
                title={
                    <React.Fragment>
                        <NavLink to={`/dashboard/posted/job/details/${job.job_post_id}`}>{job.job_post_title}</NavLink>
                    </React.Fragment>
                }
                details={
                    <React.Fragment>
                        <div className='row-detail'><FontAwesomeIcon icon={faUserCircle} className='text-special mr-1' /> {job.job_post_as_user ? <Username username={job.job_post_user} color='alt-highlight' /> : <NavLink to={job.job_post_company_website}>{job.job_post_company}</NavLink>}</div>
                        <div className='row-detail'><FontAwesomeIcon icon={faCalendarAlt} className='text-special mr-1' /> {moment(job.job_post_date).format('MM-DD-YYYY')}</div>
                        <div className='row-detail'><FontAwesomeIcon icon={faSackDollar} className='text-special mr-1' /> {budget}</div>
                        <div className='row-detail'>{local} {online} {remote}</div>
                    </React.Fragment>
                }
                buttons={
                    <span>Applicants: {job.application_count}</span>
                }
                />
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