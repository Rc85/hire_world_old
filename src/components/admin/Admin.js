import React, { Component } from 'react';
import { NavLink, Route } from 'react-router-dom';
import Overview from './Overview';
import Categories from './Categories';
import Response from '../Response';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class Admin extends Component {
    render() {
        console.log(this.props.user);
        /* if (this.props.user) {
            return(
                <section id='admin' className='main-panel'>
                    <div className='tab-container'>
                        <NavLink to='/admin'><div className='tab-button active'>Overview</div></NavLink>
                        <NavLink to='/admin/categories'><div className='tab-button'>Categories</div></NavLink>
                    </div>

                    <div className='blue-panel shallow three-rounded'>
                        <Route exact path='/admin' component={Overview} />
                        <Route exact path='/admin/categories' component={Categories} />
                    </div>
                </section>
            )
        } else {
            return(
                <Response code={403} header={'Unauthorized Access'} message={`You're not authorized to access this page.`} />
            )
        } */
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(Admin));