import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUserCog, faSignOutAlt, faUsersCog, faSignInAlt, faUserPlus, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { LogoutUser } from '../../../actions/LoginActions';
import PropTypes from 'prop-types';
import { ToggleMenu } from '../../../actions/MenuActions';
import Loading from '../../utils/Loading';
import UserPanel from './UserPanel';

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

        return(
            <nav id='navbar-container'>
                <div id='navbar'>
                    <UserPanel user={this.props.user} />

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