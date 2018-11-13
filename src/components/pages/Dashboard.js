import React from 'react';
import { withRouter } from 'react-router-dom';
import Response from './Response';
import TabBar from '../utils/TabBar';
import Loading from '../utils/Loading';
import PropTypes from 'prop-types';

const Dashboard = props => {
    let success = /success$/;
    let fail = /fail$/;

    if (success.test(props.user.status) || props.user.user) {
        return(
            <section id='dashboard' className='main-panel w-100'>
                <TabBar items={[
                    {name: 'Edit', active: props.location.pathname === '/dashboard/edit', link: '/dashboard/edit'},
                    {name: 'List Settings', active: props.location.pathname === '/dashboard/list', link: '/dashboard/list'},
                    {name: 'Saved Listings', active: props.location.pathname === '/dashboard/saved_listings', link: '/dashboard/saved_listings'},
                    {name: 'Account Settings', active: props.location.pathname === '/dashboard/settings', link: '/dashboard/settings'},
                ]} />

                {props.children}
            </section>
        )
    } else if (fail.test(props.user.status)) {
        return <Response code={401} header='Unauthorized Access' message={`You're not logged in`} />
    } else if (!props.user.status) {
        return <Loading size='7x' />
    } else if (!props.user.user) {
        return <Response code={401} header='Unauthorized Access' message={`You're not logged in`} />
    } else {
        return(
            <div></div>
        )
    }
}

Dashboard.propTypes = {
    user: PropTypes.object.isRequired
}

export default withRouter(Dashboard);