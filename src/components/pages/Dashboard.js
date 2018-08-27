import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, NavLink } from 'react-router-dom';
import '../../styles/Dashboard.css';
import Response from '../pages/Response';
import TabBar from '../utils/TabBar';

class Dashboard extends Component {
    render() {
        if (this.props.user) {
            return(
                <section id='dashboard' className='main-panel w-100'>
                    <TabBar items={[
                        {name: 'Edit', active: this.props.location.pathname === '/dashboard/edit' ? true : false, link: '/dashboard/edit'},
                        {name: 'Inquiries', active: this.props.location.pathname === '/dashboard/inquiries' ? true : false, link: '/dashboard/inquiries'},
                        {name: 'Offers', active: this.props.location.pathname === '/dashboard/offers' ? true : false, link: '/dashboard/offers'},
                        {name: 'Active Jobs', active: this.props.location.pathname === '/dashboard/active-jobs' ? true : false, link: '/dashboard/active-jobs'},
                        {name: 'Completed', active: this.props.location.pathname === '/dashboard/completed' ? true : false, link: '/dashboard/completed'},
                        {name: 'Settings', active: this.props.location.pathname === '/dashboard/settings' ? true : false, link: '/dashboard/settings'},
                    ]} />

                    {this.props.child}
                </section>
            )
        } else {
            return(
                <Response code={401} header='Unauthorized Access' message={`You're not logged in`} />
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(Dashboard));