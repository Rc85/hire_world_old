import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import fetch from 'axios';
import { LogError } from '../../utils/LogError';
import InputWrapper from '../../utils/InputWrapper';
import InputGroup from '../../utils/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faCheck } from '@fortawesome/pro-solid-svg-icons';
import { IsTyping } from '../../../actions/ConfigActions';
import { connect } from 'react-redux';
import SubmitButton from '../../utils/SubmitButton';
import { withRouter } from 'react-router-dom';

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
    suggestedTitles: [],
    local: false,
    remote: false,
    online: false,
    localFocused: false,
    remoteFocused: false,
    onlineFocused: false,
    type: '',
    show: false
}

class FilterListings extends Component {
    constructor(props) {
        super(props);

        let state = {...initialState};
        
        this.state = state;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.config.mobile) {
            document.body.style.overflowY = 'auto';
        }

        if (prevProps.location.key !== this.props.location.key) {
            this.setState({show: false});
        }
    }
    
    getTitles(val) {
        if (val) {
            fetch.post('/api/user/search/titles', {value: val})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({suggestedTitles: resp.data.titles});
                } else {
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                }
            })
            .catch(err => LogError(err, '/api/user/search/titles'));
        } else {
            this.setState({suggestedTitles: []});
        }
    }

    filter() {
        this.setState({show: false});
        this.props.filter(this.state);
    }

    toggleSearch() {
        if (this.props.config.mobile && !this.state.show) {
            document.body.style.overflowY = 'hidden';
        } else if (this.props.config.mobile && this.state.show) {
            document.body.style.overflowY = '';
        }

        this.setState({show: !this.state.show});
    }
    
    render() {
        let filters;

        if (this.props.type === 'profiles') {
            filters = <React.Fragment>
                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Profession Title'>
                            <input type='text' name='titles' id='title-list' list='list-of-titles' onChange={(e) => this.setState({title: e.target.value})} value={this.state.title} onKeyUp={(e) => this.getTitles(e.target.value)} placeholder='Search for specific profession' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                            <datalist id='list-of-titles'>
                                {this.state.suggestedTitles.map((title, i) => {
                                    return <option key={i} value={title}>{title}</option>
                                })}
                            </datalist>
                        </InputWrapper>
                    </div>

                    <div className='setting-child quarter'>
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

                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputGroup label='Price'>
                            <select name='operator' id='price-operator'className='no-border-radius-right' onChange={(e) => this.setState({priceOperator: e.target.value})} value={this.state.priceOperator}>
                                <option value='='>Exactly</option>
                                <option value='>'>More than</option>
                                <option value='<'>Less than</option>
                            </select>

                            <div className='justify-content-center input-group-text-seperator'>$</div>
                            
                            <input type='number' name='search-price' id='search-price'className='no-border-radius w-100' onChange={(e) => this.setState({price: e.target.value})} value={this.state.price} placeholder='Search by desired price' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputGroup>
                    </div>

                    <div className='setting-child'>
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

            
                <div className='setting-field-container d-flex-between-center mb-3'>
                    <div className='setting-child'>
                        <InputGroup label='Completed Jobs'>
                            <select name='completed-jobs-op' id='completed-jobs-op'className='no-border-radius-right' onChange={(e) => this.setState({completedJobsOp: e.target.value})} value={this.state.completedJobsOp}>
                                <option value='='>Exactly</option>
                                <option value='>'>More than</option>
                                <option value='<'>Less than</option>
                            </select>
                        
                            <input type='number' name='completed-jobs' id='completed-jobs'className='no-border-radius-left' onChange={(e) => this.setState({completedJobs: e.target.value})} value={this.state.completedJobs} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputGroup>
                    </div>

                    <div className='setting-child quarter text-center'><label htmlFor='have-reviews'><input type='checkbox' id='have-reviews' onClick={() => this.setState({haveReviews: !this.state.haveReviews})} value={this.state.haveReviews} /> Have Reviews</label></div>

                    <div className='setting-child quarter text-center'><label htmlFor='is-connected'><input type='checkbox' id='is-connected' onClick={() => this.setState({isLinked: !this.state.isLinked})} value={this.state.isLinked} /> Linked Only</label></div>

                    <div className='setting-child quarter text-center'><label htmlFor='no-abandoned-jobs'><input type='checkbox' id='no-abandoned-jobs' onClick={() => this.setState({noAbandonedJobs: !this.state.noAbandonedJobs})} value={this.state.noAbandonedJobs} /> No Abandoned Jobs</label></div>
                </div>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Country'><CountryDropdown value={this.state.country} onChange={(val) => this.setState({country: val})} valueType='short' /></InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputWrapper label='Region'><RegionDropdown country={this.state.country} value={this.state.region} onChange={(val) => this.setState({region: val})} countryValueType='short' valueType='short' /></InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputWrapper label='City'><input type='text' name='city' id='search-city' onChange={(e) => this.setState({city: e.target.value})} value={this.state.city} placeholder='Your city' onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} /></InputWrapper>
                    </div>
                </div>
            </React.Fragment>;
        } else if (this.props.type === 'jobs') {
            filters = <React.Fragment>
                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Profession Title'>
                            <input type='text' onChange={(e) => this.setState({title: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child one-third'>
                        <InputWrapper label='Work Area' >
                            <div className='checkbox-label-container'>
                                <label className={`checkbox-label ${this.state.local ? 'active' : ''} ${this.state.localFocused ? 'hovered' : ''}`} name='work-area' >
                                    <input type='checkbox' onChange={() => this.setState({local: !this.state.local})} onFocus={() => this.setState({localFocused: true})} onBlur={() => this.setState({localFocused: false})} />

                                    <div className='checkbox-container'>
                                        <div className='checkbox'>
                                            {this.state.local ? <FontAwesomeIcon icon={faCheck} /> : ''}
                                        </div>
                                        <span className='checkbox-label-text'>Local</span>
                                    </div>
                                </label>

                                <label className={`checkbox-label ${this.state.remote ? 'active' : ''} ${this.state.remoteFocused ? 'hovered' : ''}`} name='work-area' >
                                    <input type='checkbox' onChange={() => this.setState({remote: !this.state.remote})} onFocus={() => this.setState({remoteFocused: true})} onBlur={() => this.setState({remoteFocused: false})} />

                                    <div className='checkbox-container'>
                                        <div className='checkbox'>
                                            {this.state.remote ? <FontAwesomeIcon icon={faCheck} /> : ''}
                                        </div>
                                        <span className='checkbox-label-text'>Remote</span>
                                    </div>
                                </label>

                                <label className={`checkbox-label ${this.state.online ? 'active' : ''} ${this.state.onlineFocused ? 'hovered' : ''}`} name='work-area' >
                                    <input type='checkbox' onChange={() => this.setState({online: !this.state.online})} onFocus={() => this.setState({onlineFocused: true})} onBlur={() => this.setState({onlineFocused: false})} />

                                    <div className='checkbox-container'>
                                        <div className='checkbox'>
                                            {this.state.online ? <FontAwesomeIcon icon={faCheck} /> : ''}
                                        </div>
                                        <span className='checkbox-label-text'>Link Work</span>
                                    </div>
                                </label>
                            </div>
                        </InputWrapper>
                    </div>
                </div>

                <div className='d-flex-between-center mb-3'>
                    <div className='setting-child quarter'>
                        <InputWrapper label='Job Type'>
                            <select onChange={(e) => this.setState({type: e.target.value})}>
                                <option value=''></option>
                                <option value='Temporary'>Temporary</option>
                                <option value='Part-time'>Part-time</option>
                                <option value='Full-time'>Full-time</option>
                                <option value='Contract'>Contract</option>
                                <option value='Project'>Project</option>
                            </select>
                        </InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputGroup label='Payment Type'>
                            <select onChange={(e) => this.setState({payment: e.target.value})}>
                                <option value=''></option>
                                <option value='Salary'>Salary</option>
                                <option value='Hourly Wage'>Hourly Wage</option>
                                <option value='Budget'>Budget</option>
                            </select>

                            <select onChange={(e) => this.setState({threshold: e.target.value})}>
                                <option value=''></option>
                                <option value='Exactly'>Exactly</option>
                                <option value='Approximately'>Approximately</option>
                                <option value='Between'>Between</option>
                                <option value='To Be Discussed'>To Be Discussed</option>
                            </select>

                            <input type='text' onChange={(e) => this.setState({paymentStart: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />

                            {this.state.threshold === 'Between' ? <React.Fragment>
                                <div className='input-group-text-separator'>to</div>
                                <input type='text' onChange={(e) => this.setState({paymentEnd: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                            </React.Fragment> : ''}
                        </InputGroup>
                    </div>
                </div>

                <div className='setting-field-container mb-3'>
                    <div className='setting-child'>
                        <InputWrapper label='Country' >
                            <CountryDropdown value={this.state.country} onChange={(val) => this.setState({'country': val})} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputWrapper label='Region' >
                            <RegionDropdown value={this.state.region} onChange={(val) => this.setState({'region': val})} country={this.state.country} />
                        </InputWrapper>
                    </div>

                    <div className='setting-child'>
                        <InputWrapper label='City' >
                            <input type='text' onChange={(e) => this.setState({'city': e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))}  />
                        </InputWrapper>
                    </div>
                </div>

                <label><input type='checkbox' onChange={() => this.setState({companyOnly: !this.state.companyOnly})} /> Company post only</label>
            </React.Fragment>
        }

        return (
            <React.Fragment>
                <div id='search-container'>
                    <div id='search-toggler' onClick={() => this.toggleSearch()}><FontAwesomeIcon icon={this.state.show ? faChevronUp : faChevronDown} size='2x' className='mr-1' /> <h4>Filter</h4></div>

                    <form className={!this.state.show ? 'hide' : ''} onSubmit={(e) => {
                        e.preventDefault();
                        this.filter()
                    }}>
                        <div id='search-field-container' className={!this.state.show ? 'hide' : ''}>
                            {filters}
                
                            <div className='text-right'>
                                <SubmitButton type='submit' loading={this.state.status === 'Loading'} value='Filter' />
                                <button type='button' className='btn btn-secondary' onClick={() => this.setState(initialState)}>Clear</button>
                            </div>
                        </div>
                    </form>
                </div>
            </React.Fragment>
        );
    }
}

FilterListings.propTypes = {
    filter: PropTypes.func
};

const mapStateToProps = state => {
    return {
        config: state.Config
    }
}

export default withRouter(connect(mapStateToProps)(FilterListings));