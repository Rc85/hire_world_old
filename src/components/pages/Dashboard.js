import React, { Component } from 'react';
import { withRouter, Redirect, NavLink } from 'react-router-dom';
import Loading from '../utils/Loading';
import PropTypes from 'prop-types';
import SideBar from '../includes/site/SideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faColumns, faCommentAlt, faCog, faShoppingCart, faSyncAlt, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import BottomBar from '../includes/site/BottomBar';
import { connect } from 'react-redux';
import { faListAlt } from '@fortawesome/free-regular-svg-icons';
import Response from './Response';
import { GetSession } from '../../actions/FetchActions';

class Dashboard extends Component {
    constructor(props) {
        super(props);
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.key !== this.props.location.key) {
            this.props.dispatch(GetSession());
        }
    }
    
    render() {
        let dashboard;

        let items = [
            {name: 'My Listing', link: '/dashboard/my-listing', active: /^\/dashboard\/my-listing/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faListAlt} />},
            {name: 'Messages', link: '/dashboard/messages', active: /^\/dashboard\/messages/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCommentAlt} />, messageCount: parseInt(this.props.user.messages)},
            /* {name: 'Jobs', link: '/dashboard/jobs', active: /^\/dashboard\/jobs/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faBriefcase} />, messageCount: parseInt(this.props.user.proposals) + parseInt(this.props.user.estimates), items: [
                {name: 'Opened', active: this.props.location.pathname === '/dashboard/jobs/opened', link: '/dashboard/jobs/opened', messageCount: parseInt(this.props.user.proposals) + parseInt(this.props.user.estimates)},
                {name: 'Active', active: this.props.location.pathname === '/dashboard/jobs/active', link: '/dashboard/jobs/active'},
                {name: 'Completed', active: this.props.location.pathname === '/dashboard/jobs/completed', link: '/dashboard/jobs/completed'},
                {name: 'Abandoned', active: this.props.location.pathname === '/dashboard/jobs/abandoned', link: '/dashboard/jobs/abandoned'}
            ]}, */
            /* {name: 'Subscription', link: '/dashboard/subscription/purchase', active: this.props.location.pathname === '/dashboard/subscription/purchase', icon: <FontAwesomeIcon icon={faSyncAlt} />}, */
            {name: 'Settings', link: '/dashboard/settings/account', active: /^\/dashboard\/settings/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCog} />, items: [
                {name: 'Account', active: this.props.location.pathname === '/dashboard/settings/account', link: '/dashboard/settings/account'},
                {name: 'Payment', active: this.props.location.pathname === '/dashboard/settings/payment', link: '/dashboard/settings/payment'},
                //{name: 'Connected', active: this.props.location.pathname === '/dashboard/settings/connected', link: '/dashboard/settings/connected'},
            ]}
        ];

        if (this.props.user.status === 'get session success' && this.props.user.user) {
            if (this.props.location.pathname.match(/^\/dashboard/)) {
                dashboard = <Redirect to='/dashboard' />;
            }

            dashboard = <section id='dashboard'>
                {!this.props.config.IsMobile ? <SideBar user={this.props.user} items={items} /> : <BottomBar user={this.props.user} items={items} />}

                <div id='dashboard-main'>
                    {this.props.location.pathname.match(/^\/dashboard\/edit$/) ? <div id='main-panel-bg'></div> : ''}
                    {this.props.children}
                </div>
            </section>;
        } else if (this.props.user.status === 'access error') {
            dashboard = <section id='dashboard'>
                {!this.props.config.IsMobile ? <SideBar user={this.props.user} items={items} /> : <BottomBar user={this.props.user} items={items} />}

                <div id='dashboard-main'>
                    <Response code={403} header={'Forbidden'} message={this.props.user.statusMessage}>{this.props.user.statusMessage === `You need to activate your account` ? <div><NavLink to='/resend'>Resend Confirmation Email</NavLink></div> : ''}</Response>
                </div>
            </section>;
        } else {
            dashboard = <section id='dashboard'>
                {!this.props.config.IsMobile ? <SideBar user={this.props.user} items={items} /> : <BottomBar user={this.props.user} items={items} />}

                <div id='dashboard-main'>
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