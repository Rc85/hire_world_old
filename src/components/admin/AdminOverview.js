import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from 'axios';
import Response from '../pages/Response';
import Loading from '../utils/Loading';
import { LogError } from '../utils/LogError';
import TitledContainer from '../utils/TitledContainer';

class AdminOverview extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            listingPerSector: []
        }
    }
    
    componentDidMount() {
        fetch.post('/api/admin/get/overview')
        .then(resp => {
            if (resp.data.status === 'success') {
                resp.data.status = '';

                this.setState(resp.data);
            } else if (resp.data.status === 'error') {
                this.setState({status: 'server error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/admin/get/overview');
            this.setState({status: 'client error'});
        });
    }
    
    render() {
        let status;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        } else if (this.state.status === 'server error') {
            return <div className='blue-panel shallow three-rounded'><Respponse code={500} header='Internal Server Error' message='An error occurred while trying to retrieve the data' /></div>;
        } else if (this.state.status === 'client error') {
            return <div className='blue-panel shallow three-rounded'><Response code={400} header='Bad Request' message='An error occurred while trying to process the data' /></div>;
        }

        let userStats = [
            <div key='active' className='admin-container-counter-row'><strong>Active Users:</strong> {this.state.activeUsers && this.state.activeUsers.active_users}</div>,
            <div key='banned' className='admin-container-counter-row'><strong>Permanently Banned Users:</strong> {this.state.bannedUsers && this.state.bannedUsers.banned_users}</div>,
            <div key='pending' className='admin-container-counter-row'><strong>Pending Users:</strong> {this.state.pendingUsers && this.state.pendingUsers.pending_users}</div>,
            <div key='suspended' className='admin-container-counter-row'><strong>Temporary Banned Users:</strong> {this.state.suspendedUsers && this.state.suspendedUsers.suspended_users}</div>,
            <hr key='separator-1' />,
            <div key='subscribed' className='admin-container-counter-row'><strong>Subscribed Users:</strong> {this.state.subscribedUsers && this.state.subscribedUsers.subscribed_users}</div>,
            <div key='unsubscribed' className='admin-container-counter-row'><strong>Non-subscribed Users:</strong> {this.state.normalUsers && this.state.normalUsers.normal_users}</div>,
            <hr key='separator-2' />,
            <div key='total-users' className='admin-container-counter-row'><strong>Total Users:</strong> {this.state.userCount && this.state.userCount.user_count}</div>
        ];

        let jobStats = [
            <div key='abandoned' className='admin-container-counter-row'><strong>Abandoned Jobs:</strong> {this.state.abandonedJobs && this.state.abandonedJobs.abandoned_jobs}</div>,
            <div key='active-jobs' className='admin-container-counter-row'><strong>Active Jobs:</strong> {this.state.activeJobs && this.state.activeJobs.active_jobs}</div>,
            <div key='completed' className='admin-container-counter-row'><strong>Completed Jobs:</strong> {this.state.completedJobs && this.state.completedJobs.completed_jobs}</div>,
            <div key='incomplete' className='admin-container-counter-row'><strong>Incomplete Jobs:</strong> {this.state.incompleteJobs && this.state.incompleteJobs.incomplete_jobs}</div>,
            <hr key='separator' />,
            <div key='total-jobs' className='admin-container-counter-row'><strong>Total Jobs:</strong> {this.state.totalJobs && this.state.totalJobs.total_jobs}</div>,
        ];

        let listingStats = [
            <div key='active-listings' className='admin-container-counter-row'><strong>Active Listings:</strong> {this.state.activeListings && this.state.activeListings.active_listings}</div>,
            <div key='inactive-listings' className='admin-container-counter-row'><strong>Inactive Listings:</strong> {this.state.inactiveListings && this.state.inactiveListings.inactive_listings}</div>,
            <hr key='separator' />,
            <div key='total-listings' className='admin-container-counter-row'><strong>Total Listings:</strong> {this.state.totalListings && this.state.totalListings.total_listings}</div>,
        ];

        let listingPerSector = this.state.listingPerSector.map((l, i) => {
            let badgeClass;

            if (l.sector_status === 'Open') {
                badgeClass = 'success';
            } else if (l.sector_status === 'Close') {
                badgeClass = 'warning';
            } else if (l.sector_status === 'Delete') {
                badgeClass = 'danger';
            }

            return <div key={i} className='admin-panel-counter-row w-30'><span><span className={`mini-badge mini-badge-${badgeClass} mr-1`}>{l.sector_status}</span>{l.sector}</span> <span>{l.listing_count ? l.listing_count : 0}</span></div>
        });

        return(
            <div className='main-panel'>
                {status}

                <div className='admin-panel-container mt-5 mb-5'>
                    <div className='w-30'>
                        <TitledContainer title='Users'>{userStats}</TitledContainer>
                    </div>

                    <div className='w-30'>
                        <TitledContainer title='Jobs'>{jobStats}</TitledContainer>
                    </div>

                    <div className='w-30'>
                        <TitledContainer title='Listings'>{listingStats}</TitledContainer>
                    </div>
                </div>

                <TitledContainer title='Listings By Sectors'>
                    <div className='admin-panel-container'>{listingPerSector}</div>
                </TitledContainer>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(AdminOverview));