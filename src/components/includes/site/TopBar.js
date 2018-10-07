import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import NavBar from './NavBar';
import { connect } from 'react-redux';

class TopBar extends Component {
    render() {
        return(
            <section id='topbar'>
                <div id='logo'>
                    <NavLink to='/'><h1>M-ploy</h1></NavLink>
                </div>

                <NavBar user={this.props.user} toggleMenu={() => this.props.toggleMenu()} menuOpen={this.props.menuOpen} />
            </section>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login
    }
}

export default connect(mapStateToProps)(TopBar);