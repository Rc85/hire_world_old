import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Response from '../pages/Response';
import TabBar from '../utils/TabBar';
import Loading from '../utils/Loading';

class Dashboard extends Component {
    render() {
        let blank = /^\s$/;
        let success = /success$/;
        let fail = /fail$/;

        if (success.test(this.props.user.status) || this.props.user.user) {
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
        } else if (fail.test(this.props.user.status)) {
            return(
                <Response code={401} header='Unauthorized Access' message={`You're not logged in`} />
            )
        } else if (this.props.user.status === '') {
            return(
                <Loading size='7x' />
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login
    }
}

export default withRouter(connect(mapStateToProps)(Dashboard));