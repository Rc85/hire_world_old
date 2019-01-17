import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import Response from './Response';
import TabBar from '../utils/TabBar';
import Loading from '../utils/Loading';
import PropTypes from 'prop-types';
import SideBar from '../includes/site/SideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faColumns, faCommentAlt, faCog, faThList } from '@fortawesome/free-solid-svg-icons';
import BottomBar from '../includes/site/BottomBar';
import { GetSession, GetUserNotificationAndMessageCount } from '../../actions/FetchActions';
import { connect } from 'react-redux';

class Dashboard extends Component {
    constructor(props) {
        super(props);
    }

    redirect() {
        location.href = '/resend-confirmation';
    }
    
    render() {
        let status;

        /* if (this.props.user.status === 'getting session') {
            return <Loading size='7x' />;
        } else if (this.props.user.status === 'get session fail' || this.props.user.status === 'access error' || this.props.user.status === 'error') {
            return <Redirect to='/' />;
        } else if (this.props.user.status === 'inactive error') {
            this.redirect();
        } else if (this.props.user.status === 'get session success') { */
        let windowWidth = window.innerWidth;
        let totalMessages = parseInt(this.props.user.messages.inquiries) + parseInt(this.props.user.messages.active) + parseInt(this.props.user.messages.completed) + parseInt(this.props.user.messages.abandoned);

        let items = [
            {name: 'Dashboard', link: '/dashboard/edit', active: /^\/dashboard/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faColumns} />, items: [
                {name: 'Profile', active: this.props.location.pathname === '/dashboard/edit', link: '/dashboard/edit'},
                {name: 'Friends', active: this.props.location.pathname === '/dashboard/friends', link: '/dashboard/friends'},
                {name: 'Medals', active: this.props.location.pathname === '/dashboard/medals', link: '/dashboard/medals'}
            ]},
            {name: 'Messages', link: '/messages/Inquire', active: /^\/messages/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCommentAlt} />, messageCount: totalMessages, items: [
                {name: 'Inquiries', active: this.props.location.pathname === '/messages/Inquire', link: '/messages/Inquire', messageCount: parseInt(this.props.user.messages.inquiries)},
                {name: 'Active', active: this.props.location.pathname === '/messages/Active', link: '/messages/Active', messageCount: parseInt(this.props.user.messages.active)},
                {name: 'Completed', active: this.props.location.pathname === '/messages/Completed', link: '/messages/Completed', messageCount: this.props.user.messages.completed},
                {name: 'Abandoned', active: this.props.location.pathname === '/messages/Abandoned', link: '/messages/Abandoned', messageCount: this.props.user.messages.abandoned}
            ]},
            {name: 'Settings', link: '/settings/listing', active: /^\/settings/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCog} />, items: [
                {name: 'Listing', active: this.props.location.pathname === '/settings/listing', link: '/settings/listing'},
                {name: 'Account', active: this.props.location.pathname === '/settings/account', link: '/settings/account'},
                {name: 'Payment', active: this.props.location.pathname === '/settings/payment', link: '/settings/payment'},
                {name: 'Subscription', active: this.props.location.pathname === '/settings/subscription', link: '/settings/subscription'},
            ]}
        ];

        return(
            <section id='dashboard'>
                {!this.props.config.isMobile ? <SideBar user={this.props.user} items={items} /> : <BottomBar user={this.props.user} items={items} />}

                <div id='dashboard-main'>
                    {this.props.location.pathname.match(/^\/dashboard/) ? <div id='main-panel-bg'></div> : ''}
                    {this.props.children}
                </div>
            </section>
        )
        /* }

        return <div></div> */
    }
}

Dashboard.propTypes = {
    user: PropTypes.object.isRequired,
}

const mapStateToProps = state => {
    return {
        config: state.Config
    }
}

export default withRouter(connect(mapStateToProps)(Dashboard));