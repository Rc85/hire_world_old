import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import fetch from 'axios';
import { LogError } from '../../utils/LogError';
import InputWrapper from '../../utils/InputWrapper';
import InputGroup from '../../utils/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { IsTyping } from '../../../actions/ConfigActions';
import { connect } from 'react-redux';
import SubmitButton from '../../utils/SubmitButton';

const initialState = {
    title: '',
    rating: 'Any',
    priceOperator: '=',
    price: '',
    priceType: '',
    completedJobsOp: '=',
    completedJobs: '',
    noAbandonedJobs: false,
    country: '',
    region: '',
    city: '',
    searchedTitles: []
}

class SearchListing extends Component {
    constructor(props) {
        super(props);

        let state = {...initialState};
        state['show'] = false;
        
        this.state = state;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.config.IsMobile) {
            document.body.style.overflowY = 'auto';
        }
    }
    
    getTitles(val) {
        if (val) {
            fetch.post('/api/user/search/titles', {value: val})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({searchedTitles: resp.data.titles});
                } else {
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                }
            })
            .catch(err => LogError(err, '/api/user/search/titles'));
        }
    }

    filter() {
        this.setState({show: false});
        this.props.filter(this.state);
    }

    toggleSearch() {
        if (this.props.config.IsMobile && !this.state.show) {
            document.body.style.overflowY = 'hidden';
        } else if (this.props.config.IsMobile && this.state.show) {
            document.body.style.overflowY = '';
        }

        this.setState({show: !this.state.show});
    }
    
    render() {
        return (
            <React.Fragment>
                <div id='search-container'>
                    <div id='search-toggler' onClick={() => this.toggleSearch()}><FontAwesomeIcon icon={this.state.show ? faChevronUp : faChevronDown} size='2x' className='mr-1' /> <h4>Filter</h4></div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        this.filter()
                    }}>
                        <div id='search-field-container' className={!this.state.show ? 'hide' : ''}>
                            <div id='search-field-wrapper'>
                                <div className='d-flex-between-start mb-3'>
                                    <div className='fg-1'>
                                        <InputWrapper label='Profession Title'>
                                            <input type='text' name='titles' id='title-list' list='list-of-titles' onChange={(e) => this.setState({title: e.target.value})} value={this.state.title} onKeyUp={(e) => this.getTitles(e.target.value)} placeholder='Search for specific profession' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                                            <datalist id='list-of-titles'>
                                                {this.state.searchedTitles.map((title, i) => {
                                                    return <option key={i} value={title}>{title}</option>
                                                })}
                                            </datalist>
                                        </InputWrapper>
                                    </div>
                
                                    <div className='no-fg'>
                                        <InputWrapper label='Rating'>
                                            <select name='rating' id='search-rating' onChange={(e) => this.setState({rating: e.target.value})} value={this.state.rating}>
                                                <option value='Any'>Any</option>
                                                <option value='0'>0 Star</option>
                                                <option value='1'>1 Star</option>
                                                <option value='2'>2 Star</option>
                                                <option value='3'>3 Star</option>
                                                <option value='4'>4 Star</option>
                                                <option value='5'>5 Star</option>
                                            </select>
                                        </InputWrapper>
                                    </div>
                                </div>
    
                                <div className='d-flex-between-start mb-3'>
                                    <div className='fg-1'>
                                        <InputGroup label='Price'>
                                            <select name='operator' id='price-operator'className='no-border-radius-right' onChange={(e) => this.setState({priceOperator: e.target.value})} value={this.state.priceOperator}>
                                                <option value='='>Equal to</option>
                                                <option value='>'>Greater than</option>
                                                <option value='<'>Less than</option>
                                            </select>
                
                                            <div className='justify-content-center input-group-text-seperator'>$</div>
                                            
                                            <input type='number' name='search-price' id='search-price'className='no-border-radius w-100' onChange={(e) => this.setState({price: e.target.value})} value={this.state.price} placeholder='Search by desired price' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                                        </InputGroup>
                                    </div>
    
                                    <div className='no-fg'>
                                        <InputWrapper label='Frequency'>
                                            <select name='price-type' id='price-type'className='no-border-radius-left' onChange={(e) => this.setState({priceType: e.target.value})} value={this.state.priceType}>
                                                <option value=''>Any</option>
                                                <option value='Hourly'>Hourly</option>
                                                <option value='Bi-weekly'>Bi-weekly</option>
                                                <option value='Monthly'>Monthly</option>
                                                <option value='Per Delivery'>Per Delivery</option>
                                                <option value='One Time Payment'>One Time Payment</option>
                                            </select>
                                        </InputWrapper>
                                    </div>
                                </div>
                
                                <div className='d-flex-between-start mb-3'>
                                    <div className='w-100 d-flex-between-center'>
                                        <div className='fg-1'>                            
                                            <InputGroup label='Completed Jobs'>
                                                <select name='completed-jobs-op' id='completed-jobs-op'className='no-border-radius-right' onChange={(e) => this.setState({completedJobsOp: e.target.value})} value={this.state.completedJobsOp}>
                                                    <option value='='>Equal to</option>
                                                    <option value='>'>Greater than</option>
                                                    <option value='<'>Less than</option>
                                                </select>
                                            
                                                <input type='number' name='completed-jobs' id='completed-jobs'className='no-border-radius-left' onChange={(e) => this.setState({completedJobs: e.target.value})} value={this.state.completedJobs} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                                            </InputGroup>
                                        </div>
                
                                        <div className='no-fg'><label htmlFor='no-abandoned-jobs'><input type='checkbox' name='no-abandoned-jobs' id='no-abandoned-jobs' onClick={() => this.setState({noAbandonedJobs: !this.state.noAbandonedJobs})} value={this.state.noAbandonedJobs} /> No Abandoned Jobs</label></div>
                                    </div>
                                </div>
                
                                <div className='d-flex-between-start mb-3'>
                                    <div className='w-30'>
                                        <InputWrapper label='Country'><CountryDropdown value={this.state.country} onChange={(val) => this.setState({country: val})} valueType='short' /></InputWrapper>
                                    </div>
                
                                    <div className='w-30'>
                                        <InputWrapper label='Region'><RegionDropdown country={this.state.country} value={this.state.region} onChange={(val) => this.setState({region: val})} countryValueType='short' valueType='short' /></InputWrapper>
                                    </div>
                
                                    <div className='w-30'>
                                        <InputWrapper label='City'><input type='text' name='city' id='search-city' onChange={(e) => this.setState({city: e.target.value})} value={this.state.city} placeholder='Your city' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} /></InputWrapper>
                                    </div>
                                </div>
                
                                <div className='text-right'>
                                    <SubmitButton type='submit' loading={this.state.status === 'Loading'} value='Filter' />
                                    <button className='btn btn-secondary' onClick={() => this.setState(initialState)}>Clear</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </React.Fragment>
        );
    }
}

SearchListing.propTypes = {
    filter: PropTypes.func
};

const mapStateToProps = state => {
    return {
        config: state.Config
    }
}

export default connect(mapStateToProps)(SearchListing);