import React, { Component } from 'react';
import { withRouter, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from 'axios';
import Loading from '../utils/Loading';
import Alert from '../utils/Alert';

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
        fetch.post('/api/get/services/listings', {sector: this.props.name})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({
                    status: 'success',
                    listings: resp.data.services
                });
            } else {
                this.setState({
                    status: resp.data.status,
                    statusMessage: resp.data.statusMessage
                });
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        let loading, listForm, button, error;

        if (this.state.status === 'loading') {
            loading = <Loading size='5x' />
        } else if (this.state.status === 'error') {
            error = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />
        }

        let listings = this.state.listings.map((listing, i) => {
            return <div key={i} className='listing-row mb-2'>
                <div className='w-50'><NavLink to={`/service/${listing.service_id}`}>{listing.service_name}</NavLink></div>
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

export default withRouter(connect()(Sectors));