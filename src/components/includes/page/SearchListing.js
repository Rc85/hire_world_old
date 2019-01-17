import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import fetch from 'axios';
import { LogError } from '../../utils/LogError';
import InputWrapper from '../../utils/InputWrapper';
import InputGroup from '../../utils/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

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
        state['show'] = true;
        
        this.state = state;
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
    
    render() {
        return (
            <div id='search-listings'>
                <div id='search-listings-field-container' className={!this.state.show ? 'hide' : ''}>
                    <div className='d-flex-between-start mb-3'>
                        <div className=' w-25'>
                            <InputWrapper label='Profession Title'>
                                <input type='text' name='titles' id='title-list' list='list-of-titles' onChange={(e) => this.setState({title: e.target.value})} value={this.state.title} onKeyUp={(e) => this.getTitles(e.target.value)} placeholder='Enter a title to search' />
                                <datalist id='list-of-titles'>
                                    {this.state.searchedTitles.map((title, i) => {
                                        return <option key={i} value={title}>{title}</option>
                                    })}
                                </datalist>
                            </InputWrapper>
                        </div>
    
                        <div className='w-10'>
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
    
                        <div className='w-30'>
                            <InputGroup label='Price'>
                                <div className='w-15'>
                                    <select name='operator' id='price-operator'className='no-border-radius-right' onChange={(e) => this.setState({priceOperator: e.target.value})} value={this.state.priceOperator}>
                                        <option value='='>&#61;</option>
                                        <option value='>='>&#62;&#61;</option>
                                        <option value='>'>&#62;</option>
                                        <option value='<='>&#60;&#61;</option>
                                        <option value='<'>&#60;</option>
                                    </select>
                                </div>
    
                                <div className='w-10 justify-content-center input-group-text seperator'>$</div>
                                
                                <div className='w-20'>
                                    <input type='number' name='search-price' id='search-price'className='no-border-radius' onChange={(e) => this.setState({price: e.target.value})} value={this.state.price} placeholder='Price' />
                                </div>
    
                                <div className='w-10 justify-content-center input-group-text seperator'>/</div>
    
                                <div className='w-45'>
                                    <select name='price-type' id='price-type'className='no-border-radius-left' onChange={(e) => this.setState({priceType: e.target.value})} value={this.state.priceType}>
                                        <option value=''>Choose...</option>
                                        <option value='Hour'>Hour</option>
                                        <option value='Bi-weekly'>Bi-weekly</option>
                                        <option value='Delivery'>Delivery</option>
                                        <option value='One Time Payment'>One Time Payment</option>
                                    </select>
                                </div>
                            </InputGroup>
                        </div>
    
                        <div className='w-30 d-flex-between-center'>
                            <div className='w-45'>                            
                                <InputGroup label='Completed Jobs'>
                                    <div className='d-flex-between-center'>
                                        <select name='completed-jobs-op' id='completed-jobs-op'className='no-border-radius-right' onChange={(e) => this.setState({completedJobsOp: e.target.value})} value={this.state.completedJobsOp}>
                                            <option value='='>&#61;</option>
                                            <option value='>='>&#62;&#61;</option>
                                            <option value='>'>&#62;</option>
                                            <option value='<='>&#60;&#61;</option>
                                            <option value='<'>&#60;</option>
                                        </select>
                                        <input type='number' name='completed-jobs' id='completed-jobs'className='no-border-radius-left' onChange={(e) => this.setState({completedJobs: e.target.value})} value={this.state.completedJobs} />
                                    </div>
                                </InputGroup>
                            </div>
    
                            <div className='w-45'><label htmlFor='no-abandoned-jobs'><input type='checkbox' name='no-abandoned-jobs' id='no-abandoned-jobs' onClick={() => this.setState({noAbandonedJobs: !this.state.noAbandonedJobs})} value={this.state.noAbandonedJobs} /> No Abandoned Jobs</label></div>
                        </div>
                    </div>
    
                    <div className='d-flex-between-start mb-3'>
                        <div className='w-30'>
                            <InputWrapper label='Country'><CountryDropdown value={this.state.country} onChange={(val) => this.setState({country: val})}  /></InputWrapper>
                        </div>
    
                        <div className='w-30'>
                            <InputWrapper label='Region'><RegionDropdown country={this.state.country} value={this.state.region} onChange={(val) => this.setState({region: val})}  /></InputWrapper>
                        </div>
    
                        <div className='w-30'>
                            <InputWrapper label='City'><input type='text' name='city' id='search-city' onChange={(e) => this.setState({city: e.target.value})} value={this.state.city} placeholder='Your city'/></InputWrapper>
                        </div>
                    </div>
    
                    <div className='text-right'>
                        <button className='btn btn-primary mr-1' onClick={() => this.props.filter(this.state)}>Filter</button>
                        <button className='btn btn-secondary' onClick={() => this.setState(initialState)}>Clear</button>
                    </div>
                </div>

                <div id='search-listings-toggler'><FontAwesomeIcon icon={this.state.show ? faChevronUp : faChevronDown} size='2x' onClick={() => this.setState({show: !this.state.show})} /></div>
            </div>
        );
    }
}

SearchListing.propTypes = {

};

export default SearchListing;