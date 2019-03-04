import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThList, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { LogError } from '../utils/LogError';
import fetch from 'axios';
import ListingRow from '../includes/page/ListingRow';
import { NavLink } from 'react-router-dom';

class Main extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            listings: []
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Fetching'});

        fetch.post('/api/get/listings', {recent: true})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', listings: resp.data.listings});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/listings/recent');
            this.setState({status: ''});
        });
    }
    
    render() {
        return (
            <section id='main' className='main-panel'>
                <TitledContainer title='Recent Listings' icon={<FontAwesomeIcon icon={faClipboardList} />} shadow bgColor='lime' className='mb-5'>
                    {this.state.listings.map((listing, i) => {
                        return <ListingRow key={i} listing={listing} />
                    })}
                </TitledContainer>

                <TitledContainer title='Sectors' icon={<FontAwesomeIcon icon={faThList} />} shadow bgColor='violet'>
                    <div className='sector-rows-container'>
                        {this.props.sectors.map((sector, i) => {
                            return <div key={i} className='sector-row'>
                                <div className='sector-row-name'>
                                    <NavLink to={`/sectors/${sector.sector}`}>{sector.sector}</NavLink>
                                    {/* <div>{sector.listing_count === null ? 0 : sector.listing_count}</div> */}
                                </div>

                                <div className='sector-row-definition'>{sector.sector_definition}</div>
                            </div>
                        })}
                    </div>
                </TitledContainer>
            </section>
        );
    }
}

Main.propTypes = {

};

export default Main;