import React, { Component } from 'react';
import NavBar from './NavBar';
import { connect } from 'react-redux';
import Logo from '../../../../dist/images/logo_sm.png';

class TopBar extends Component {
    render() {
        return(
            <section id='topbar'>
                <div id='logo'>
                    <a href='/'><img src={Logo} alt='M-ploy'/></a>
                </div>

                <NavBar user={this.props.user} />
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