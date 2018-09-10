import React, { Component } from 'react';
import ViewUserSocialMedia from '../includes/page/ViewUserSocialMedia';
import ViewUserContacts from '../includes/page/ViewUserContacts';
import ViewUserProfile from '../includes/page/ViewUserProfile';
import ViewUserServices from '../includes/page/ViewUserServices';
import { withRouter } from 'react-router-dom';
import fetch from 'axios';
import Loading from '../utils/Loading';
import Response from './Response';

class ViewUser extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            services: null,
            status: ''
        }
    }

    componentDidMount() {
        this.setState({status: 'Loading'});

        fetch.post('/api/get/user', {username: this.props.match.params.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({
                    user: resp.data.user,
                    services: resp.data.services,
                    status: ''
                })
            } else {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        let status, avatar, contacts, socialMedia, profile, services, review;

        switch(this.state.status) {
            case 'Loading': status = <Loading size='5x' />
        }

        if (this.state.user) {
            contacts = <ViewUserContacts user={this.state.user} />;
            socialMedia = <ViewUserSocialMedia user={this.state.user} />;
            profile = <ViewUserProfile user={this.state.user} />;
            services = <ViewUserServices services={this.state.services} />;
        }

        if (this.state.status === 'error') {
            return(
                <Response header={'Error'} message={this.state.statusMessage} /> 
            )
        } else {
            return(
                <div id='view-user' className='main-panel'>
                    {status}
                    <div className='blue-panel shallow rounded'>
                        <div className='row'>
                            <div className='col-3'>
                                {contacts}
                                {socialMedia}
                            </div>

                            <div className='col-9'>
                                {profile}

                                {services}
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}

export default withRouter(ViewUser);