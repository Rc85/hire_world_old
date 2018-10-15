import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';

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
    city: ''
}

class SearchListing extends Component {
    constructor(props) {
        super(props);
        
        this.state = initialState;
    }
    
    render() {
        console.log(this.state)
        return (
            <div className='blue-panel shallow rounded mb-5'>
                <div className='d-flex-between-start mb-3'>
                    <div className=' w-25'>
                        <label htmlFor='title-list'>Profession Title:</label>
                        <input type='text' name='titles' id='title-list' className='form-control' onChange={(e) => this.setState({title: e.target.value})} value={this.state.title} />
                    </div>

                    <div className='w-10'>
                        <label htmlFor='search-rating'>Rating:</label>
                        <select name='rating' id='search-rating' className='form-control' onChange={(e) => this.setState({rating: e.target.value})} value={this.state.rating}>
                            <option value='Any'>Any</option>
                            <option value='0'>0 Star</option>
                            <option value='1'>1 Star</option>
                            <option value='2'>2 Star</option>
                            <option value='3'>3 Star</option>
                            <option value='4'>4 Star</option>
                            <option value='5'>5 Star</option>
                        </select>
                    </div>

                    <div className='w-30'>
                        <label htmlFor='search-price'>Price:</label>

                        <div className='d-flex-between-center input-group'>
                            <div className='w-15'>
                                <select name='operator' id='price-operator' className='form-control no-border-radius-right' onChange={(e) => this.setState({priceOperator: e.target.value})}>
                                    <option value='='>&#61;</option>
                                    <option value='>='>&#62;&#61;</option>
                                    <option value='>'>&#62;</option>
                                    <option value='<='>&#60;&#61;</option>
                                    <option value='<'>&#60;</option>
                                </select>
                            </div>

                            <div className='w-10 justify-content-center input-group-text seperator'>$</div>
                            
                            <div className='w-20'>
                                <input type='number' name='search-price' id='search-price' className='form-control no-border-radius' onChange={(e) => this.setState({price: e.target.value})}/>
                            </div>

                            <div className='w-10 justify-content-center input-group-text seperator'>/</div>

                            <div className='w-45'>
                                <select name='price-type' id='price-type' className='form-control no-border-radius-left' onChange={(e) => this.setState({priceType: e.target.value})}>
                                    <option>-</option>
                                    <option value='Hour'>Hour</option>
                                    <option value='Bi-weekly'>Bi-weekly</option>
                                    <option value='Delivery'>Delivery</option>
                                    <option value='One Time Payment'>One Time Payment</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className='w-30 d-flex-between-end'>
                        <div className='w-45'>
                            <label htmlFor='completed-jobs'>Completed Jobs:</label>
                            
                            <div className='d-flex-between-center'>
                                <select name='completed-jobs-op' id='completed-jobs-op' className='form-control no-border-radius-right' onChange={(e) => this.setState({completedJobsOp: e.target.value})}>
                                    <option value='='>&#61;</option>
                                    <option value='>='>&#62;&#61;</option>
                                    <option value='>'>&#62;</option>
                                    <option value='<='>&#60;&#61;</option>
                                    <option value='<'>&#60;</option>
                                </select>
                                <input type='number' name='completed-jobs' id='completed-jobs' className='form-control no-border-radius-left' onChange={(e) => this.setState({completedJobs: e.target.value})}/>
                            </div>
                        </div>

                        <div className='w-45'><label htmlFor='no-abandoned-jobs'><input type='checkbox' name='no-abandoned-jobs' id='no-abandoned-jobs' onClick={() => this.setState({noAbandonedJobs: !this.state.noAbandonedJobs})}/> No Abandoned Jobs</label></div>
                    </div>
                </div>

                <div className='d-flex-between-start mb-3'>
                    <div className='w-30'>
                        <label>Country:</label>
                        <CountryDropdown value={this.state.country} onChange={(val) => this.setState({country: val})} classes='form-control' />
                    </div>

                    <div className='w-30'>
                        <label>Region:</label>
                        <RegionDropdown country={this.state.country} value={this.state.region} onChange={(val) => this.setState({region: val})} classes='form-control' />
                    </div>

                    <div className='w-30'>
                        <label htmlFor='search-city'>City:</label>
                        <input type='text' name='city' id='search-city' className='form-control' onChange={(e) => this.setState({city: e.target.value})} value={this.state.city} />
                    </div>
                </div>

                <div className='text-right'>
                    <button className='btn btn-primary mr-1' onClick={() => this.props.filter(this.state)}>Filter</button>
                    <button className='btn btn-secondary' onClick={() => this.setState(initialState)}>Clear</button>
                </div>
            </div>
        );
    }
}

SearchListing.propTypes = {

};

export default SearchListing;