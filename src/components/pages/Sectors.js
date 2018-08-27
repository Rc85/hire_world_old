import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
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
            listings: []
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

    render() {
        let loading, listForm, button, error;

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