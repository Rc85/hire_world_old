import React, { Component } from 'react';
import NavBar from './NavBar';
import { connect } from 'react-redux';

class TopBar extends Component {
    render() {
        return(
            <section id='topbar'>
                <div id='logo'>
                    <a href='/'><h1>M-ploy</h1></a>
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