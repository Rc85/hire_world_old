import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUserCog, faSignOutAlt, faUsersCog, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { LogoutUser } from '../../../actions/LoginActions';
import PropTypes from 'prop-types';
import { ToggleMenu } from '../../../actions/MenuActions';

class NavBar extends Component {
    toggleMenu() {
        if (this.props.menu.open !== 'main') {
            this.props.dispatch(ToggleMenu('main', ''));
        } else if (this.props.menu.open === 'main') {
            this.props.dispatch(ToggleMenu('', 'main'));
        }
    }

    render() {
        let menuIcon = <FontAwesomeIcon icon={faBars} size='2x' />;
        let closeIcon = <FontAwesomeIcon icon={faTimes} size='2x' />;
        let admin, dashboard, login, register, logout;

        if (this.props.user.user && this.props.user.user.user_level) {
            admin = <div className='nav-item' title='Admin'>
                {this.props.user.user.user_level > 6 ? <NavLink to='/admin/overview'><FontAwesomeIcon icon={faUsersCog} size='2x' /></NavLink> : ''} 
            </div>
        }

        if (this.props.user.user) {
            dashboard = <div className='nav-item' title='Dashboard'><NavLink to='/dashboard/edit'><FontAwesomeIcon icon={faUserCog} size='2x' /></NavLink></div>;
            logout = <div className='nav-item' title='Logout' onClick={() => this.props.dispatch(LogoutUser())}><FontAwesomeIcon icon={faSignOutAlt} size='2x' /></div>;
        } else {
            login = <div className='nav-item' title='Login'><NavLink to='/account/login'><FontAwesomeIcon icon={faSignInAlt} size='2x' /></NavLink></div>;
            register = <div className='nav-item' title='Register'><NavLink to='/account/register'><FontAwesomeIcon icon={faUserPlus} size='2x' /></NavLink></div>;
        }

        return(
            <nav id='navbar-container'>
                <div id='navbar'>
                    {login}
                    {register}
                    {dashboard}
                    {admin}
                    {logout}

                    <div id='browse-menu-button' className='nav-item' onClick={() => this.toggleMenu()}>
                        {this.props.menu.open === 'main' ? closeIcon : menuIcon}
                    </div>
                </div>
            </nav>
        )
    }
}

NavBar.propTypes = {
    user: PropTypes.object
}

const mapStateToProps = state => {
    return {
        menu: state.Menu
    }
}

export default connect(mapStateToProps)(NavBar);