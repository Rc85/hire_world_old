import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import Menu from '../../utils/Menu';
import { connect } from 'react-redux';
import { ToggleMenu } from '../../../actions/MenuActions';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import fetch from 'axios';
import { Alert } from '../../../actions/AlertActions';
import { PromptOpen, PromptReset } from '../../../actions/PromptActions';

class AdminUserRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            user: this.props.user || {
                account_type: '',
                user_last_login: '',
                user_level: '',
                user_status: '',
                username: ''
            }
        }
    }
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.prompt.input && nextProps.prompt.data.user === this.state.user.username) {
            this.handleUserChange(nextProps.prompt.data.col, nextProps.prompt.data.val, nextProps.prompt.input);
            this.props.dispatch(PromptReset());
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.user.username !== this.props.user.username) {
            this.setState({user: this.props.user});
        }
    }
        
    toggleMenu() {
        if (this.props.menu.open !== 'admin') {
            this.props.dispatch(ToggleMenu('admin', '', this.state.user.username));
        } else if (this.props.menu.open === 'admin') {
            this.props.dispatch(ToggleMenu('', 'admin', this.state.user.username));
        }
    }

    menuClick(menu, selection) {
        if (menu === 'Status' && selection === 'Ban') {
            this.props.dispatch(PromptOpen(`Specify a reason for banning this user`, {user: this.state.user.username, col: menu, val: selection, action: 'ban user'}));
        } else if (menu === 'Status' && selection === 'Suspend') {
            this.props.dispatch(PromptOpen('Specifiy a reason for suspending this user', {user: this.state.user.username, col: menu, val: selection, action: 'suspend user'}));
        } else if (menu && selection) {
            this.handleUserChange(menu, selection);
        }
    }

    handleUserChange(menu, selection, reason) {
        this.setState({status: 'Sending'});

        fetch.post('/api/admin/user/change-status', {username: this.state.user.username, column: menu, val: selection, reason: reason})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', user: resp.data.user});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});

                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        let menu, userStatus, userLevel;

        if (this.props.menu.open === 'admin' && this.state.user.username === this.props.menu.id) {
            let items = {
                'Status': ['Active', 'Ban', 'Suspend'],
                'Level': ['User', 'Moderator', 'Admin'],
                'Account': ['User', 'Listing', 'Business']
            }

            menu = <Menu items={items} onClick={(menu, selection) => this.menuClick(menu, selection)} />;
        }

        if (this.state.user.user_status === 'Active') {
            userStatus = <span className='badge badge-success'>{this.state.user.user_status}</span>;
        } else if (this.state.user.user_status === 'Suspend') {
            userStatus = <span className='badge badge-warning'>{this.state.user.user_status}</span>;
        } else if (this.state.user.user_status === 'Ban') {
            userStatus = <span className='badge badge-danger'>{this.state.user.user_status}</span>;
        }

        if (this.state.user.user_level === 0) {
            userLevel = 'User';
        } else if (this.state.user.user_level === 79) {
            userLevel = 'Moderator';
        } else if (this.state.user.user_level === 89) {
            userLevel = 'Admin'
        }

        return (
            <div className='d-flex-between-center mb-3'>
                <div className='w-30'><NavLink to={`/user/${this.state.user.username}`}>{this.state.user.username}</NavLink></div>
                <div className='w-15'>{userStatus}</div>
                <div className='w-15'>{userLevel}</div>
                <div className='w-15'>{this.state.user.account_type}</div>
                <div className='w-20'>{moment(this.state.user.user_last_login).format('MM-DD-YYYY hh:mm:ss') !== 'Invalid date' ? moment(this.state.user.user_last_login).format('MM-DD-YYYY h:mm:ss') : ''}</div>
                <div className='w-5 text-right position-relative'>
                    <button className='btn btn-info btn-sm admin-menu-button' onClick={() => this.toggleMenu()}><FontAwesomeIcon icon={faCaretDown} /></button>
                    {menu}
                </div>
            </div>
        );
    }
}

AdminUserRow.propTypes = {
    user: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return {
        menu: state.Menu,
        prompt: state.Prompt
    }
}

export default connect(mapStateToProps)(AdminUserRow);