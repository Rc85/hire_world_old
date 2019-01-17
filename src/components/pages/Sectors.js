import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from 'axios';
import Loading from '../utils/Loading';
import { Alert } from '../../actions/AlertActions';
import ListingRow from '../includes/page/ListingRow';
import SearchListing from '../includes/page/SearchListing';
import { LogError } from '../utils/LogError';
import Response from '../pages/Response';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThList } from '@fortawesome/free-solid-svg-icons';

class Sectors extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sector: this.props.match.params.sector,
            status: 'loading',
            statusMessage: '',
            listings: []
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.key !== this.props.location.key) {
            fetch.post('/api/get/listings', {sector: this.props.match.params.sector})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', sector: this.props.match.params.sector, listings: resp.data.listings});
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
                this.setState({status: '', listings: resp.data.listings});
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
            this.setState({status: '', listings: resp.data.listings});

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/filter/listings'));
    }

    render() {
        let listings = this.state.listings.map((listing, i) => {
            return <ListingRow key={i} listing={listing} />
        });

        if (this.state.status === 'access error') {
            return(<Response code={500} header='Internal Server Error' message={this.state.statusMessage} />)
        }

        return(
            <React.Fragment>
                <SearchListing filter={(data) => this.filterListings(data)} />
                
                <section id='listings' className='main-panel'>
                    <TitledContainer title={this.state.sector} bgColor='primary' icon={<FontAwesomeIcon icon={faThList} />}shadow >
                        <div className='listings-container'>
                            {listings}
                        </div>
                    </TitledContainer>
                </section>
            </React.Fragment>
        )
    }
}

export default withRouter(connect()(Sectors));