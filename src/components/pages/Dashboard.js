import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import Loading from '../utils/Loading';
import PropTypes from 'prop-types';
import SideBar from '../includes/site/SideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faColumns, faCommentAlt, faCog, faShoppingCart, faSyncAlt, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import BottomBar from '../includes/site/BottomBar';
import { connect } from 'react-redux';
import { faListAlt } from '@fortawesome/free-regular-svg-icons';

class Dashboard extends Component {
    constructor(props) {
        super(props);
    }

    redirect() {
        location.href = '/resend-confirmation';
    }
    
    render() {
        let dashboard;

        let items = [
            {name: 'My Listing', link: '/my-listing', active: /^\/my-listing/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faListAlt} />},
            {name: 'Messages', link: '/messages', active: /^\/messages/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCommentAlt} />, messageCount: this.props.user.messages/* , items: [
                {name: 'Inquiries', active: this.props.location.pathname === '/messages/Inquire', link: '/messages/Inquire', messageCount: parseInt(this.props.user.messages.inquiries)},
            ] */},
            {name: 'Jobs', link: '/jobs', active: /^\/jobs/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faBriefcase} />, items: [
                {name: 'Offers', active: this.props.location.pathname === '/jobs/Offers', link: '/jobs/Offers'},
                {name: 'Active', active: this.props.location.pathname === '/jobs/Active', link: '/jobs/Active'},
                {name: 'Completed', active: this.props.location.pathname === '/jobs/Completed', link: '/jobs/Completed'},
                {name: 'Abandoned', active: this.props.location.pathname === '/jobs/Abandoned', link: '/jobs/Abandoned'}
            ]},
            {name: 'Subscription', link: '/subscription/purchase', active: this.props.location.pathname === '/subscription/purchase', icon: <FontAwesomeIcon icon={faSyncAlt} />, items: [
                {name: 'Purchase', active: this.props.location.pathname === '/subscription/purchase', link: '/subscription/purchase'},
                {name: 'Details', active: this.props.location.pathname === '/subscription/details', link: '/subscription/details'}
            ]},
            {name: 'Settings', link: '/settings/account', active: /^\/settings/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCog} />, items: [
                /* {name: 'Listing', active: this.props.location.pathname === '/settings/listing', link: '/settings/listing'}, */
                {name: 'Account', active: this.props.location.pathname === '/settings/account', link: '/settings/account'},
                {name: 'Payment', active: this.props.location.pathname === '/settings/payment', link: '/settings/payment'},
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