import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AdminSearchUsers from './includes/AdminSearchUsers';
import Loading from '../utils/Loading';
import fetch from 'axios';
import { connect } from 'react-redux';
import Pagination from '../utils/Pagination';
import AdminUserRow from './includes/AdminUserRow';

class AdminUsers extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: '',
            users: [],
            offset: 0,
            totalUsers: 0,
            username: '',
            userStatus: '',
            level: '',
            type: ''
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        this.prevStateObj = {
            username: prevState.username,
            userStatus: prevState.userStatus,
            level: prevState.level,
            type: prevState.type,
            offset: prevState.offset
        }

        this.thisStateObject = {
            username: this.state.username,
            userStatus: this.state.userStatus,
            level: this.state.level,
            type: this.state.type,
            offset: this.state.offset
        }

        if (JSON.stringify(this.prevStateObj) !== JSON.stringify(this.thisStateObject)) {
            this.setState({status: 'Loading'});

            fetch.post('/api/admin/get/users', {username: this.state.username, status: this.state.userStatus, level: this.state.level, type: this.state.type, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', users: resp.data.users, totalUsers: parseInt(resp.data.totalUsers)});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});

                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                }
            })
            .catch(err => console.log(err));
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Loading'});

        fetch.post('/api/admin/get/users', {username: this.state.username, status: this.state.userStatus, level: this.state.level, type: this.state.type, offset: this.state.offset})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', users: resp.data.users, totalUsers: parseInt(resp.data.totalUsers)});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => console.log(err));
    }

    filterUsers(data) {
        this.setState({username: data.username, status: data.status, level: data.level, type: data.type});
    }
    
    render() {
        let status, users;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        if (this.state.users.length === 0) {
            users = <div className='blue-panel shallow three-rounded text-center'>
                <h1 className='text-muted'>No users were found</h1>
            </div>
        } else {
            users = this.state.users.map((user, i) => {
                return <AdminUserRow key={i} user={user} />
            });
        }

        return (
            <div className='blue-panel shallow three-rounded'>
                {status}
                <AdminSearchUsers filter={(data) => this.filterUsers(data)} currentState={{username: this.state.username, status: this.state.status, level: this.state.level, type: this.state.type}} />

                <div className='mb-3'><Pagination totalItems={this.state.totalUsers} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} /></div>

                <div className='d-flex-between-center'>
                    <div className='w-5'><strong>ID</strong></div>
                    <div className='w-45'><strong>Username</strong></div>
                    <div className='w-15'><strong>Status</strong></div>
                    <div className='w-15'><strong>Level</strong></div>
                    <div className='w-15'><strong>Account Type</strong></div>
                    <div className='w-5'></div>
                </div>

                <hr/>

                {users}
                
                <hr/>

                <Pagination totalItems={this.state.totalUsers} itemsPerPage={25} currentPage={this.state.offset / 25} onClick={(i) => this.setState({offset: i * 25})} />
            </div>
        );
    }
}

AdminUsers.propTypes = {
    user: PropTypes.object
};

export default connect()(AdminUsers);