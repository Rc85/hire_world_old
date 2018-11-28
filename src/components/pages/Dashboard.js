import React from 'react';
import { withRouter } from 'react-router-dom';
import Response from './Response';
import TabBar from '../utils/TabBar';
import Loading from '../utils/Loading';
import PropTypes from 'prop-types';

const Dashboard = props => {
    let status;

    if (props.user.status === 'getting session') {
        status = <Loading size='7x' />;
    } else if (props.user.status === 'get session fail') {
        return <Response code={401} header='Unauthorized Access' message={`You're not logged in`} />;
    } else if (props.user.status === 'access error' || props.user.status === 'error') {
        return <Response code={403} header='Unpermitted Access' message={props.user.statusMessage} />;
    } else if (props.user.status === 'inactive error') {
        let message = <span>
            <p>{this.props.user.statusMessage}</p>
            <p><a href='/resend-confirmation'>Resend Confirmation Email</a></p>
        </span>;
        
        return <Response code={403} header='Forbidden' message={message} />;
    } else if (props.user.status === 'get session success') {
        return(
            <section id='dashboard' className='main-panel w-100'>
                <TabBar items={[
                    {name: 'Profile', active: props.location.pathname === '/dashboard/edit', link: '/dashboard/edit'},
                    {name: 'List Settings', active: props.location.pathname === '/dashboard/list', link: '/dashboard/list'},
                    {name: 'Saved Listings', active: props.location.pathname === '/dashboard/saved_listings', link: '/dashboard/saved_listings'},
                    {name: 'Account Settings', active: props.location.pathname === '/dashboard/settings', link: '/dashboard/settings'},
                ]} />

                {status}
                {props.children}
            </section>
        )
    }

    return <div></div>
}

Dashboard.propTypes = {
    user: PropTypes.object.isRequired
}

export default withRouter(Dashboard);