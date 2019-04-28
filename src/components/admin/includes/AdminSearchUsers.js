import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/pro-solid-svg-icons';
import { connect } from 'react-redux';
import InputWrapper from '../../utils/InputWrapper';

class AdminSearchUsers extends Component {
    constructor(props) {
        super(props);
        
        this.state ={
            username: '',
            status: '',
            level: '',
            type: ''
        }
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
        return (
            <React.Fragment>
                <div id='search-container'>
                    <div id='search-toggler' onClick={() => this.toggleSearch()}><FontAwesomeIcon icon={this.state.show ? faChevronUp : faChevronDown} size='2x' className='mr-1' /> <h4>Filter</h4></div>

                    <div id='search-field-container' className={!this.state.show ? 'hide' : ''}>
                        <div id='search-field-wrapper'>
                            <div className='d-flex-between-start mb-1'>
                                <InputWrapper label='Username' className='w-20'>
                                    <input type='text' name='username' id='search-username' onChange={(e) => this.setState({username: e.target.value})} />
                                </InputWrapper>

                                <InputWrapper label='Status' className='w-20'>
                                    <select name='status' id='search-status' onChange={(e) => this.setState({status: e.target.value})}>
                                        <option value=''></option>
                                        <option value='Active'>Active</option>
                                        <option value='Ban'>Ban</option>
                                        <option value='Pending'>Pending</option>
                                        <option value='Suspend'>Suspend</option>
                                    </select>
                                </InputWrapper>

                                <InputWrapper label='Level' className='w-20'>
                                    <select name='level' id='search-level' onChange={(e) => this.setState({level: e.target.value})}>
                                        <option value=''></option>
                                        <option value='User'>User</option>
                                        <option value='Moderator'>Moderator</option>
                                        <option value='Admin'>Admin</option>
                                    </select>
                                </InputWrapper>

                                <InputWrapper label='Account' className='w-20'>
                                    <select name='type' id='search-type' onChange={(e) => this.setState({type: e.target.value})}>
                                        <option value=''></option>
                                        <option value='User'>User</option>
                                        <option value='Listing'>Listing</option>
                                        <option value='Business'>Business</option>
                                    </select>
                                </InputWrapper>
                            </div>

                            <div className='text-right'><button className='btn btn-primary' onClick={() => this.props.filter(this.state)} disabled={JSON.stringify(this.props.currentState) === JSON.stringify(this.state)}>Filter</button></div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

AdminSearchUsers.propTypes = {
    filter: PropTypes.func.isRequired,
    currentState: PropTypes.object
};

const mapStateToProps = state => {
    return {
        config: state.Config
    }
}

export default connect(mapStateToProps)(AdminSearchUsers);