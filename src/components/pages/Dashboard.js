import React, { Component } from 'react';
import { withRouter, Redirect, NavLink } from 'react-router-dom';
import Loading from '../utils/Loading';
import PropTypes from 'prop-types';
import SideBar from '../includes/site/SideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faColumns, faCommentAlt, faCog, faShoppingCart, faSyncAlt, faBriefcase, faLink } from '@fortawesome/pro-solid-svg-icons';
import BottomBar from '../includes/site/BottomBar';
import { connect } from 'react-redux';
import { faListAlt } from '@fortawesome/pro-regular-svg-icons';
import Response from './Response';
import { GetSession } from '../../actions/FetchActions';
import { faFilePlus, faUser } from '@fortawesome/pro-solid-svg-icons';

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
            {name: 'My Profile', link: '/dashboard/profile', active: /^\/dashboard\/profile/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faUser} />},
            {name: 'Conversations', link: '/dashboard/messages', active: /^\/dashboard\/messages/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCommentAlt} />, messageCount: parseInt(this.props.user.messages)},
            {name: 'Post a Job', link: '/dashboard/post/job', active: this.props.location.pathname === '/dashboard/post/job', icon: <FontAwesomeIcon icon={faFilePlus} />},
            {name: 'My Jobs', link: '/dashboard/jobs', active: /^\/dashboard\/(jobs|job|posted)/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faBriefcase} />, messageCount: parseInt(this.props.user.proposals) + parseInt(this.props.user.job_messages.opened_job_message_count) + parseInt(this.props.user.job_messages.active_job_message_count), items: [
                {name: 'Saved', active: this.props.location.pathname === '/dashboard/saved/jobs', link: '/dashboard/saved/jobs'},
                {name: 'Posted', active: /^\/dashboard\/posted\/(jobs|job)/.test(this.props.location.pathname), link: '/dashboard/posted/jobs'},
                {name: 'Applied', active: this.props.location.pathname === '/dashboard/applied/jobs', link: '/dashboard/applied/jobs'},
                {name: 'Proposals', active: this.props.location.pathname === '/dashboard/jobs/opened', link: '/dashboard/jobs/opened', messageCount: parseInt(this.props.user.proposals) + parseInt(this.props.user.job_messages.opened_job_message_count)},
                {name: 'Active', active: this.props.location.pathname === '/dashboard/jobs/active', link: '/dashboard/jobs/active', messageCount: parseInt(this.props.user.job_messages.active_job_message_count)},
                {name: 'Completed', active: this.props.location.pathname === '/dashboard/jobs/complete', link: '/dashboard/jobs/complete'},
                {name: 'Abandoned', active: this.props.location.pathname === '/dashboard/jobs/abandoned', link: '/dashboard/jobs/abandoned'}
            ]},
            {name: 'Connect', link: '/dashboard/connect', active: this.props.location.pathname === '/dashboard/connect', icon: <FontAwesomeIcon icon={faLink} />},
            {name: 'Subscription', link: '/dashboard/subscription', active: this.props.location.pathname === '/dashboard/subscription', icon: <FontAwesomeIcon icon={faSyncAlt} />},
            {name: 'Settings', link: '/dashboard/settings/account', active: /^\/dashboard\/settings/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCog} />, items: [
                {name: 'Account', active: this.props.location.pathname === '/dashboard/settings/account', link: '/dashboard/settings/account'},
                {name: 'Payment', active: this.props.location.pathname === '/dashboard/settings/payment', link: '/dashboard/settings/payment'},
                {name: 'Connected', active: this.props.location.pathname === '/dashboard/settings/connected', link: '/dashboard/settings/connected'}
            ]}
        ];

        if (this.props.user.status === 'access error') {
            dashboard = <Response code={403} header={'Forbidden'} message={this.props.user.statusMessage}>{this.props.user.statusMessage === `You need to activate your account` ? <div><NavLink to='/resend'>Resend Confirmation Email</NavLink></div> : ''}</Response>;
        } else {
            dashboard = <React.Fragment>
                {this.props.location.pathname.match(/^\/dashboard\/edit$/) ? <div id='main-panel-bg'></div> : ''}      
                {this.props.children}
            </React.Fragment>;
        }

        return(
            <section id='dashboard'>
                {!this.props.config.IsMobile ? <SideBar user={this.props.user} items={items} /> : <BottomBar user={this.props.user} items={items} />}

                <div id='dashboard-main'>
                    {dashboard}
                </div>
            </section>
        );
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