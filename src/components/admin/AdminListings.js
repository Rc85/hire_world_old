import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'axios';
import { connect } from 'react-redux';
import { Alert } from '../../actions/AlertActions';
import Loading from '../utils/Loading';
import AdminSearchListings from './includes/AdminSearchListings';
import AdminListingRow from './includes/AdminListingRow';
import { withRouter } from 'react-router-dom';
import Pagination from '../utils/Pagination';

class AdminListings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            listings: [],
            offset: 0,
            totalListings: 0,
            title: '',
            sector: '',
            user: ''
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        this.prevStateObject = {
            title: prevState.title,
            sector: prevState.sector,
            user: prevState.user,
            offset: prevState.offset
        }

        this.stateObject = {
            title: this.state.title,
            sector: this.state.sector,
            user: this.state.user,
            offset: this.state.offset
        }

        if (JSON.stringify(this.prevStateObject) !== JSON.stringify(this.stateObject)) {
            this.setState({status: 'Loading'});

            fetch.post('/api/admin/listings/get', this.stateObject)
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', listings: resp.data.listings, totalListings: parseInt(resp.data.totalListings)});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                }
            })
            .catch(err => console.log(err));
        }
    }
    
    componentDidMount() {
        fetch.post('/api/admin/listings/get', {title: this.state.title, sector: this.state.sector, user: this.state.user, offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listings: resp.data.listings, totalListings: parseInt(resp.data.totalListings)});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => console.log(err));
    }

    filter(data) {
        this.setState({title: data.title, sector: data.sector, user: data.user});
    }
    
    render() {
        let status;
        let listings;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        listings = this.state.listings.map((listing, i) => {
            return <AdminListingRow key={i} listing={listing} />
        });

        return (
            <div className='blue-panel shallow three-corner'>
                {status}
                <AdminSearchListings sectors={this.props.sectors} filter={(data) => this.filter(data)} />

                <div className='mb-3'><Pagination totalItems={this.state.totalListings} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} /></div>

                <div className='d-flex-between-center'>
                    <div className='w-5'><strong>ID</strong></div>
                    <div className='w-35'><strong>Title</strong></div>
                    <div className='w-15'><strong>User</strong></div>
                    <div className='w-10'><strong>Created</strong></div>
                    <div className='w-15'><strong>Renewed</strong></div>
                    <div className='w-10'><strong>Sector</strong></div>
                    <div className='w-5'></div>
                    <div className='w-5'></div>
                </div>

                <hr/>

                {listings}
            </div>
        );
    }
}

AdminListings.propTypes = {
    sectors: PropTypes.array.isRequired
};

export default withRouter(connect()(AdminListings));