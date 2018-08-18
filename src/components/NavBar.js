import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import '../styles/NavBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { ToggleMenu } from '../actions/TogglerActions';
import { connect } from 'react-redux';
import { LogoutUser } from '../actions/LoginActions';

class NavBar extends Component {
    constructor(props) {
        super(props);

        this.toggleMenu = this.toggleMenu.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    toggleMenu() {
        let menu;

        if (this.props.menuState === false) {
            menu = true;
        } else {
            menu = false;
        }

        this.props.dispatch(ToggleMenu('TOGGLE_MAIN_MENU', menu));
    }

    handleLogout() {
        this.props.dispatch(LogoutUser());
    }

    render() {
        let menuIcon = <FontAwesomeIcon icon={faBars} size='2x' />;
        let closeIcon = <FontAwesomeIcon icon={faTimes} size='2x' />;

        return(
            <nav id='navbar-container'>
                <div id='navbar'>
                    <div className='nav-item'>
                        <NavLink to='/view'>View</NavLink>
                    </div>

                    <div className='nav-item'>
                        {this.props.user ? <NavLink to='/dashboard'><FontAwesomeIcon icon={faUser} size='2x' /></NavLink> : ''}
                    </div>

                    <div className='nav-item'>
                        {this.props.user ? <div onClick={this.handleLogout}><FontAwesomeIcon icon={faSignOutAlt} size='2x' /></div> : ''}
                    </div>

                    <div className='nav-item'>
                        <span onClick={this.toggleMenu}>{this.props.menuState ? closeIcon : menuIcon}</span>
                    </div>
                </div>
            </nav>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        menuState: state.ToggleMenu.main_menu,
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(NavBar));