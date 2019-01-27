import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import Loading from '../utils/Loading';
import PropTypes from 'prop-types';
import SideBar from '../includes/site/SideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faColumns, faCommentAlt, faCog } from '@fortawesome/free-solid-svg-icons';
import BottomBar from '../includes/site/BottomBar';
import { connect } from 'react-redux';

class Dashboard extends Component {
    constructor(props) {
        super(props);
    }

    redirect() {
        location.href = '/resend-confirmation';
    }
    
    render() {
        let dashboard;

        let totalMessages = parseInt(this.props.user.messages.inquiries) + parseInt(this.props.user.messages.active) + parseInt(this.props.user.messages.completed) + parseInt(this.props.user.messages.abandoned);

        let items = [
            {name: 'Dashboard', link: '/dashboard/edit', active: /^\/dashboard/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faColumns} />, items: [
                {name: 'Profile', active: this.props.location.pathname === '/dashboard/edit', link: '/dashboard/edit'},
                {name: 'Friends', active: this.props.location.pathname === '/dashboard/friends', link: '/dashboard/friends'},
                /* {name: 'Medals', active: this.props.location.pathname === '/dashboard/medals', link: '/dashboard/medals'} */
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
        
        if (this.props.location.pathname.match(/^\/(dashboard|messages|settings)/)) {
            if (this.props.user.status === 'getting session') {
                dashboard = <Loading size='7x' />
            } else if (this.props.user.status === 'get session success' && this.props.user.user) {
                dashboard = <section id='dashboard'>
                    {!this.props.config.isMobile ? <SideBar user={this.props.user} items={items} /> : <BottomBar user={this.props.user} items={items} />}

                    <div id='dashboard-main'>
                        {this.props.location.pathname.match(/^\/dashboard\/edit$/) ? <div id='main-panel-bg'></div> : ''}
                        {this.props.children}
                    </div>
                </section>;
            } else if (this.props.user.status === 'error') {
                dashboard = <Redirect to='/' />;
            }
        } else {
            dashboard = <section id='dashboard'>
                {!this.props.config.isMobile ? <SideBar user={this.props.user} items={items} /> : <BottomBar user={this.props.user} items={items} />}

                <div id='dashboard-main'>
                    {this.props.location.pathname.match(/^\/dashboard/) ? <div id='main-panel-bg'></div> : ''}
                    {this.props.children}
                </div>
            </section>;
        }

        return <React.Fragment>{dashboard}</React.Fragment>;
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