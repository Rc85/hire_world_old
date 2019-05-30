import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TitledContainer from '../components/utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThList, faClipboardList, faUserCircle, faCalendarAlt, faSackDollar } from '@fortawesome/pro-solid-svg-icons';
import { LogError } from '../components/utils/LogError';
import fetch from 'axios';
import { NavLink } from 'react-router-dom';
import MoneyFormatter from '../components/utils/MoneyFormatter';
import UserRating from '../components/UserRating';
import moment from 'moment';
import Row from '../components/Row';
import Username from '../components/Username';

class Main extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            profiles: []
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Fetching'});

        fetch.post('/api/get/listings', {recent: true, type: 'profiles'})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', profiles: resp.data.listings});
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
                {this.state.profiles.length > 0 ? <TitledContainer title='Featured Profiles' icon={<FontAwesomeIcon icon={faClipboardList} />} shadow bgColor='lime' className='mb-5'>
                    {this.state.profiles.map((profile, i) => {
                        let price, local, remote, online;

                        if (profile.listing_local) {
                            local = <span className='mini-badge mini-badge-orange mr-1'>Local</span>;
                        }
        
                        if (profile.listing_remote) {
                            remote = <span className='mini-badge mini-badge-green'>Remote</span>;
                        }
        
                        if (profile.listing_online) {
                            online = <span className='mini-badge mini-badge-purple mr-1'>Link Work</span>;
                        }
        
                        if (profile.listing_price_type === 'To Be Discussed') {
                            price = profile.listing_price_type;
                        } else {
                            if (profile.listing_price !== '0') {
                                price = <span>$<MoneyFormatter value={profile.listing_price} /> / {profile.listing_price_type} {profile.listing_price_currency}</span>;
                            }
                        }

                        return <Row
                        key={profile.listing_id}
                        index={i}
                        length={this.state.profiles.length}
                        title={
                            <React.Fragment>
                                <NavLink to={`/user/${profile.listing_user}`}>{profile.listing_title}</NavLink>
                            </React.Fragment>
                        }
                        details={
                            <React.Fragment>
                                <div className='row-detail'><FontAwesomeIcon icon={faUserCircle} className='text-special mr-1' /> <Username username={profile.listing_user} color='alt-highlight' /> ({profile.user_title}) {profile.link_work_acct_status === 'Approved' ? <div className='linked-status mini-badge mini-badge-success ml-1'>Linked</div> : ''}</div>
                                <div className='row-detail'><FontAwesomeIcon icon={faCalendarAlt} className='text-special mr-1' /> {moment(profile.listing_created_date).format('MM-DD-YYYY')}</div>
                                <div className='row-detail'><FontAwesomeIcon icon={faSackDollar} className='text-special mr-1' /> {price}</div>
                                <div className='row-detail'>{local} {online} {remote}</div>
                            </React.Fragment>
                        }
                        buttons={
                            <React.Fragment>
                                <UserRating rating={profile.rating} /> <span>({profile.review_count ? profile.review_count : 0})</span>
                            </React.Fragment>
                        }
                        />
                    })}
                </TitledContainer> : ''}

                <TitledContainer title='Sectors' icon={<FontAwesomeIcon icon={faThList} />} shadow bgColor='violet'>
                    {this.props.sectors.map((sector, i) => {
                        return <Row
                        key={sector.sector_id}
                        index={i}
                        length={this.props.sectors.length}
                        title={
                            <React.Fragment>
                                <strong>{sector.sector}</strong> - <small><NavLink to={`/sectors/jobs/${sector.sector}`}>Jobs</NavLink> | <NavLink to={`/sectors/profiles/${sector.sector}`}>Profiles</NavLink></small>
                            </React.Fragment>
                        }
                        details={
                            <React.Fragment>
                                <div className='row-detail ml-2'>{sector.sector_definition}</div>
                            </React.Fragment>
                        }
                        />
                    })}
                </TitledContainer>
            </section>
        );
    }
}

Main.propTypes = {

};

export default Main;