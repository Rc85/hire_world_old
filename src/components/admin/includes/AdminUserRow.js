import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import Menu from '../../utils/Menu';
import { connect } from 'react-redux';
import { ToggleMenu } from '../../../actions/MenuActions';

class AdminUserRow extends Component {
    toggleMenu() {
        if (this.props.menu.open !== 'admin') {
            this.props.dispatch(ToggleMenu('admin', '', this.props.user.user_id));
        } else if (this.props.menu.open === 'admin') {
            this.props.dispatch(ToggleMenu('', 'admin', this.props.user.user_id));
        }
    }

    render() {
        let menu, userStatus;

        if (this.props.menu.open === 'admin' && this.props.user.user_id === this.props.menu.id) {
            let items = {
                'Status': ['Active', 'Ban', 'Suspend'],
                'Level': ['User', 'Moderator', 'Admin'],
                'Account': ['User', 'Listing', 'Business']
            }

            menu = <Menu open={this.props.menu.open === 'admin' && this.props.user.user_id === this.props.menu.id} items={items} onClick={(val) => console.log(val)} />;
        }

        if (this.props.user.user_status === 'Active') {
            userStatus = <span className='badge badge-success'>{this.props.user.user_status}</span>;
        } else if (this.props.user.user_status === 'Suspended') {
            userStatus = <span className='badge badge-warning'>{this.props.user.user_status}</span>;
        } else if (this.props.user.user_status === 'Banned') {
            userStatus = <span className='badge badge-danger'>{this.props.user.user_status}</span>;
        }

        return (
            <div className='d-flex-between-center mb-3'>
                <div className='w-5'>{this.props.user.user_id}</div>
                <div className='w-45'>{this.props.user.username}</div>
                <div className='w-15'>{userStatus}</div>
                <div className='w-15'>{this.props.user.user_level}</div>
                <div className='w-15'>{this.props.user.account_type}</div>
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
        menu: state.Menu
    }
}

export default connect(mapStateToProps)(AdminUserRow);