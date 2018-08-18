import React, { Component } from 'react';
import '../styles/TopBar.css';
import { NavLink } from 'react-router-dom';
import NavBar from './NavBar';


class TopBar extends Component {
    render() {
        return(
            <section id='topbar'>
                <div id='logo'>
                    <NavLink to='/'><h1>M-ploy</h1></NavLink>
                </div>

                <NavBar />
            </section>
        )
    }
}

export default TopBar;