import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
    
    render() {
        return (
            <div className='mb-5'>
                <div className='d-flex-between-start mb-1'>
                    <div className='w-20'>
                        <label htmlFor='search-username'>Username:</label>
                        <input type='text' name='username' id='search-username' className='form-control' onChange={(e) => this.setState({username: e.target.value})} />
                    </div>

                    <div className='w-20'>
                        <label htmlFor='search-status'>Status:</label>
                        <select name='status' id='search-status' className='form-control' onChange={(e) => this.setState({status: e.target.value})}>
                            <option value=''></option>
                            <option value='Active'>Active</option>
                            <option value='Banned'>Banned</option>
                            <option value='Pending'>Pending</option>
                            <option value='Suspended'>Suspended</option>
                        </select>
                    </div>

                    <div className='w-20'>
                        <label htmlFor='search-level'>Level:</label>
                        <select name='level' id='search-level' className='form-control' onChange={(e) => this.setState({level: e.target.value})}>
                            <option value=''></option>
                            <option value='User'>User</option>
                            <option value='Moderator'>Moderator</option>
                            <option value='Admin'>Admin</option>
                        </select>
                    </div>

                    <div className='w-20'>
                        <label htmlFor='search-type'>Account Type:</label>
                        <select name='type' id='search-type' className='form-control' onChange={(e) => this.setState({type: e.target.value})}>
                            <option value=''></option>
                            <option value='User'>User</option>
                            <option value='Listing'>Listing</option>
                            <option value='Business'>Business</option>
                        </select>
                    </div>
                </div>

                <div className='text-right'><button className='btn btn-primary' onClick={() => this.props.filter(this.state)} disabled={JSON.stringify(this.props.currentState) === JSON.stringify(this.state)}>Filter</button></div>
            </div>
        );
    }
}

AdminSearchUsers.propTypes = {

};

export default AdminSearchUsers;