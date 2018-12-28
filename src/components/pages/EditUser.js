import React, { Component } from 'react';
import UserInfo from '../includes/page/UserInfo';
import { NavLink } from 'react-router-dom';
import UserProfilePic from '../includes/page/UserProfilePic';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import UserTitle from '../includes/page/UserTitle';
import fetch from 'axios';
import { LogError } from '../utils/LogError';

class EditUser extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading'
        }
    }
    
    /* componentDidMount() {
        fetch.post('/api/get/user/overview')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', notifications: resp.data.notifications, account: resp.data.account, subscription: resp.data.subscription, payment: resp.data.payment});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/user/overview');
            this.setState({status: ''});
        })
    } */
    
    render() {
        let fullName, businessName, email, phone, address;

        if (this.props.user.user) {
            if (this.props.user.user.display_fullname) {
                fullName = <div className='user-info mb-2'>
                    <div>
                        <h5>Name</h5>
                    </div>

                    <div className='ml-3 mt-3'>
                        {this.props.user.user.user_firstname} {this.props.user.user.user_lastname}
                    </div>

                    <hr/>
                </div>;
            }

            if (this.props.user.user.user_business_name) {
                businessName = <h4>{this.props.user.user.user_business_name}</h4>;
            }

            if (!this.props.user.user.hide_email) {
                email = <div className='user-info mb-2'>
                    <div>
                        <h5>Email</h5>
                    </div>

                    <div className='ml-3 mt-3'>
                        {this.props.user.user.user_email}
                    </div>

                    <hr/>
                </div>;
            }

            if (this.props.user.user.user_phone) {
                phone = <div className='user-info mb-2'>
                    <div>
                        <h5>Phone Number:</h5>
                    </div>

                    <div className='ml-3 mt-3'>
                        {this.props.user.user.user_phone}
                    </div>

                    <hr/>
                </div>;
            }

            if (this.props.user.user.user_address) {
                address = <div className='user-info mb-2'>
                    <div>
                        <h5>Address:</h5>
                    </div>

                    <div className='user-address ml-3 mt-3'>
                        {this.props.user.user.user_address}
                    </div>

                    <hr/>
                </div>;
            }
        }

        return(
            <section id='edit-user' className='blue-panel shallow three-rounded'>
                <div className='row'>
                    <div className='col-2'>
                        <UserProfilePic url={this.props.user.user ? this.props.user.user.avatar_url : ''} editable={true} />

                        <hr/>

                        <div id='user-profile'>
                            {fullName}
                            {email}
                            {phone}
                            {address}
                            <UserTitle user={this.props.user} />
                            <hr/>
                            {/* <UserInfo label='Education' value={this.props.user.user ? this.props.user.user.user_education : ''} type='user_education' status={userEducationStatus} />
                            <hr/> */}
                            <UserInfo label='Github' value={this.props.user.user ? this.props.user.user.user_github : ''} />
                            <hr/>
                            <UserInfo label='Twitter' value={this.props.user.user ? this.props.user.user.user_twitter : ''} />
                            <hr/>
                            <UserInfo label='Facebook' value={this.props.user.user ? this.props.user.user.user_facebook : ''} />
                            <hr/>
                            <UserInfo label='Instagram' value={this.props.user.user ? this.props.user.user.user_instagram : ''} />
                            <hr/>
                            <UserInfo label='LinkedIn' value={this.props.user.user ? this.props.user.user.user_linkedin : ''} />
                            <hr/>
                            <UserInfo label='Website' value={this.props.user.user ? this.props.user.user.user_website : ''} />
                        </div>
                    </div>
                    
                    <div className='col-10'>
                        <NavLink to={`/user/${this.props.user.user ? this.props.user.user.username : ''}`}><h1 className='m-0'>{this.props.user.user ? this.props.user.user.username : ''}</h1></NavLink>
                        {businessName}

                        <hr/>

                        <div className='d-flex-between-center'>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

EditUser.propTypes = {
    user: PropTypes.object.isRequired,
    status: PropTypes.string
}

const mapStateToProps = state => {
    return {
        user: state.Login
    }
}

export default connect(mapStateToProps)(EditUser);