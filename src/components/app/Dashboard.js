import React, { Component } from 'react';
import { withRouter, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import SideBar from '../includes/site/SideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentAlt, faCog, faSyncAlt, faBriefcase, faLink } from '@fortawesome/pro-solid-svg-icons';
import BottomBar from '../includes/site/BottomBar';
import { connect } from 'react-redux';
import Response from './Response';
import { faFilePlus, faUser } from '@fortawesome/pro-solid-svg-icons';
import fetch from 'axios';
import { PromptOpen, PromptReset } from '../../actions/PromptActions';

class Dashboard extends Component {
    constructor(props) {
        super(props);
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.key !== this.props.location.key) {
            fetch.post('/api/get/announcements')
            .then(resp => {
                if (resp.data.status === 'success') {
                    let ids = [];
                    let localIds = JSON.parse(localStorage.getItem('dismissed'));

                    for (let a of resp.data.announcements) {
                        if (!localIds) {
                            ids.push(a.announcement_id);
                        } else if (localIds && localIds.indexOf(a.announcement_id) < 0) {
                            ids.push(a.announcement_id);
                        }
                    }

                    this.setState({announcements: resp.data.announcements, announcementIds: ids});
                }
            })
            .catch(err => LogError(err, '/api/get/announcements'));
        }
    }

    componentDidMount() {
        fetch.post('/api/get/announcements')
        .then(resp => {
            if (resp.data.status === 'success') {
                let ids = [];
                let localIds = JSON.parse(localStorage.getItem('dismissed'));

                for (let a of resp.data.announcements) {
                    if (!localIds) {
                        ids.push(a.announcement_id);
                    } else if (localIds && localIds.indexOf(a.announcement_id) < 0) {
                        ids.push(a.announcement_id);
                    }
                }

                this.setState({announcements: resp.data.announcements, announcementIds: ids});
            }
        })
        .catch(err => LogError(err, '/api/get/announcements'));
    }
    
    render() {
        let dashboard;

        let items = [
            {name: 'My Profile', link: '/dashboard/profile', active: /^\/dashboard\/profile/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faUser} />},
            {name: 'Conversations', link: '/dashboard/conversations', active: /^\/dashboard\/conversations/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCommentAlt} />, messageCount: parseInt(this.props.user.messages)},
            {name: 'Post a Job', link: '/dashboard/post/job', active: this.props.location.pathname === '/dashboard/post/job', icon: <FontAwesomeIcon icon={faFilePlus} />},
            {name: 'My Jobs', link: '/dashboard/jobs', active: /^\/dashboard\/(jobs|job|posted|applied|saved)/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faBriefcase} />, messageCount: parseInt(this.props.user.proposals) + parseInt(this.props.user.job_messages.opened_job_message_count) + parseInt(this.props.user.job_messages.active_job_message_count), items: [
                {name: 'Saved', active: this.props.location.pathname === '/dashboard/saved/jobs', link: '/dashboard/saved/jobs'},
                {name: 'Posted', active: /^\/dashboard\/posted\/(jobs|job)/.test(this.props.location.pathname), link: '/dashboard/posted/jobs'},
                {name: 'Applied', active: this.props.location.pathname === '/dashboard/applied/jobs', link: '/dashboard/applied/jobs'},
                {name: 'Proposals', active: this.props.location.pathname === '/dashboard/jobs/opened', link: '/dashboard/jobs/opened', messageCount: parseInt(this.props.user.proposals) + parseInt(this.props.user.job_messages.opened_job_message_count)},
                {name: 'Active', active: this.props.location.pathname === '/dashboard/jobs/active', link: '/dashboard/jobs/active', messageCount: parseInt(this.props.user.job_messages.active_job_message_count)},
                {name: 'Completed', active: this.props.location.pathname === '/dashboard/jobs/complete', link: '/dashboard/jobs/complete'},
                {name: 'Abandoned', active: this.props.location.pathname === '/dashboard/jobs/abandoned', link: '/dashboard/jobs/abandoned'}
            ]},
            {name: 'Link Work', link: '/dashboard/link_work', active: this.props.location.pathname === '/dashboard/link_work', icon: <FontAwesomeIcon icon={faLink} />},
            {name: 'Subscription', link: '/dashboard/subscription', active: this.props.location.pathname === '/dashboard/subscription', icon: <FontAwesomeIcon icon={faSyncAlt} />},
            {name: 'Settings', link: '/dashboard/settings/account', active: /^\/dashboard\/settings/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCog} />, items: [
                {name: 'Account', active: this.props.location.pathname === '/dashboard/settings/account', link: '/dashboard/settings/account'},
                {name: 'Payment', active: this.props.location.pathname === '/dashboard/settings/payment', link: '/dashboard/settings/payment'},
                {name: 'Link Work', active: this.props.location.pathname === '/dashboard/settings/link_work', link: '/dashboard/settings/link_work'}
            ]}
        ];

        if (this.props.user.status === 'activation required') {
            dashboard = <Response code={403} header={'Forbidden'} message='You need to activate your account'><div><NavLink to='/resend'>Resend Confirmation Email</NavLink></div></Response>;
        } else {
            dashboard = <React.Fragment>
                {this.props.location.pathname.match(/^\/dashboard\/edit$/) ? <div id='main-panel-bg'></div> : ''}      
                {this.props.children}
            </React.Fragment>;
        }

        return(
            <section id='dashboard'>
                {!this.props.config.mobile ? <SideBar user={this.props.user} items={items} /> : <BottomBar user={this.props.user} items={items} />}

                <div id='dashboard-main'>
                    <div className={`dashboard-main-overlay ${this.props.menu.id === 'browse-menu' ? 'show' : ''}`} />
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
        config: state.Config,
        user: state.Login,
        prompt: state.Prompt,
        menu: state.Menu
    }
}

export default withRouter(connect(mapStateToProps)(Dashboard));