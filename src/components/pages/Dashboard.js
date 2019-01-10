import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Response from './Response';
import TabBar from '../utils/TabBar';
import Loading from '../utils/Loading';
import PropTypes from 'prop-types';
import SideBar from '../includes/site/SideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faColumns, faCommentAlt, faCog } from '@fortawesome/free-solid-svg-icons';
import BottomBar from '../includes/site/BottomBar';
import { GetSession, GetUserNotificationAndMessageCount } from '../../actions/FetchActions';
import { connect } from 'react-redux';

class Dashboard extends Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        let status;

        if (this.props.user.status === 'getting session') {
            status = <Loading size='7x' />;
        } else if (this.props.user.status === 'get session fail') {
            return <Response code={401} header='Unauthorized Access' message={`You're not logged in`} />;
        } else if (this.props.user.status === 'access error' || this.props.user.status === 'error') {
            return <Response code={403} header='Unpermitted Access' message={this.props.user.statusMessage} />;
        } else if (this.props.user.status === 'inactive error') {
            let message = <span>
                <p>{this.props.user.statusMessage}</p>
                <p><a href='/resend-confirmation'>Resend Confirmation Email</a></p>
            </span>;
            
            return <Response code={403} header='Forbidden' message={message} />;
        } else if (this.props.user.status === 'get session success') {
            let windowWidth = window.innerWidth;
            let totalMessages = parseInt(this.props.user.messages.inquiries) + parseInt(this.props.user.messages.active) + parseInt(this.props.user.messages.completed) + parseInt(this.props.user.messages.abandoned);

            let items = [
                {name: 'Dashboard', link: '/dashboard/edit', active: /^\/dashboard/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faColumns} className={/^\/dashboard/.test(this.props.location.pathname) ? 'text-special' : ''} />, items: [
                    {name: 'Profile', active: this.props.location.pathname === '/dashboard/edit', link: '/dashboard/edit'},
                    {name: 'Friends', active: this.props.location.pathname === '/dashboard/friends', link: '/dashboard/friends'},
                    {name: 'Medals', active: this.props.location.pathname === '/dashboard/medals', link: '/dashboard/medals'}
                ]},
                {name: 'Messages', link: '/messages/Inquire', active: /^\/messages/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCommentAlt} className={/^\/(messages|message|jobs)/.test(this.props.location.pathname) ? 'text-special' :''} />, messageCount: totalMessages, items: [
                    {name: 'Inquiries', active: this.props.location.pathname === '/messages/Inquire', link: '/messages/Inquire', messageCount: parseInt(this.props.user.messages.inquiries)},
                    {name: 'Active', active: this.props.location.pathname === '/messages/Active', link: '/messages/Active', messageCount: parseInt(this.props.user.messages.active)},
                    {name: 'Completed', active: this.props.location.pathname === '/messages/Completed', link: '/messages/Completed', messageCount: this.props.user.messages.completed},
                    {name: 'Abandoned', active: this.props.location.pathname === '/messages/Abandoned', link: '/messages/Abandoned', messageCount: this.props.user.messages.abandoned}
                ]},
                {name: 'Settings', link: '/settings/listing', active: /^\/settings/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCog} className={/^\/settings/.test(this.props.location.pathname) ? 'text-special' : ''} />, items: [
                    {name: 'Listing', active: this.props.location.pathname === '/settings/listing', link: '/settings/listing'},
                    {name: 'Account', active: this.props.location.pathname === '/settings/account', link: '/settings/account'},
                    {name: 'Payment', active: this.props.location.pathname === '/settings/payment', link: '/settings/payment'},
                    {name: 'Subscription', active: this.props.location.pathname === '/settings/subscription', link: '/settings/subscription'},
                ]}
            ];

            return(
                <section id='dashboard'>
                    {!this.props.config.isMobile ? <SideBar user={this.props.user.user} items={items} /> : <BottomBar user={this.props.user.user} items={items} />}

                    <div id='dashboard-main'>
                        {this.props.location.pathname.match(/^\/dashboard/) ? <div id='main-panel-bg'></div> : ''}
                        {this.props.children}
                    </div>
                </section>
            )
        }

        return <div></div>
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