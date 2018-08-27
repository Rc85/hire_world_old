import React, { Component } from 'react';
import '../../styles/Main.css';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class Main extends Component {
    render() {
        return(
            <section id='main' className='main-panel'>

            </section>
        )
    }
}

export default withRouter(connect()(Main));