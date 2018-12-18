import React, { Component } from 'react';
import UserInfo from '../includes/page/UserInfo';
import { NavLink } from 'react-router-dom';
import UserProfilePic from '../includes/page/UserProfilePic';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import UserTitle from '../includes/page/UserTitle';
import ListSettings from '../includes/page/ListSettings';
import { Elements, StripeProvider } from 'react-stripe-elements';
import Checkout from '../includes/page/Checkout';
import paymentMethod from '../../../dist/images/payment_methods.png';
import poweredByStripe from '../../../dist/images/powered_by_stripe.png';

class EditUser extends Component {
    render() {
        let userEducationStatus, userGithubStatus, userTwitterStatus, userFacebookStatus, userLinkedInStatus, userWebsiteStatus, userInstagramStatus, fullName, businessName, email, phone, address;

        if (this.props.user.user) {
            switch(this.props.user.status) {
                case 'edit user_education loading': userEducationStatus = 'loading'; break;
                case 'edit user_education success': userEducationStatus = 'success'; break;
                case 'edit user_education error': userEducationStatus = 'error'; break;
                case 'edit user_github loading': userGithubStatus = 'loading'; break;
                case 'edit user_github success': userGithubStatus = 'success'; break;
                case 'edit user_github error': userGithubStatus = 'error'; break;
                case 'edit user_twitter loading': userTwitterStatus = 'loading'; break;
                case 'edit user_twitter success': userTwitterStatus = 'success'; break;
                case 'edit user_twitter error': userTwitterStatus = 'error'; break;
                case 'edit user_facebook loading': userFacebookStatus = 'loading'; break;
                case 'edit user_facebook success': userFacebookStatus = 'success'; break;
                case 'edit user_facebook error': userFacebookStatus = 'error'; break;
                case 'edit user_linkedin loading': userLinkedInStatus = 'loading'; break;
                case 'edit user_linkedin success': userLinkedInStatus = 'success'; break;
                case 'edit user_linkedin error': userLinkedInStatus = 'error'; break;
                case 'edit user_website loading': userWebsiteStatus = 'loading'; break;
                case 'edit user_website success': userWebsiteStatus = 'success'; break;
                case 'edit user_website error': userWebsiteStatus = 'error'; break;
                case 'edit user_instagram loading': userInstagramStatus = 'loading'; break;
                case 'edit user_instagram success': userInstagramStatus = 'success'; break;
                case 'edit user_instagram error': userInstagramStatus = 'error'; break;
            }
            
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
                businessName = <h3>{this.props.user.user.user_business_name}</h3>;
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

        let payment = <StripeProvider apiKey='pk_test_KgwS8DEnH46HAFvrCaoXPY6R'>
            <div id='payment-input'>
                <div className='d-flex-between-center'>
                    <div className='w-50'>To begin listing, you need to subscribe to a monthly plan.</div>

                    <div className='text-right w-50'>
                        <img src={poweredByStripe} className='w-25' />
                        <img src={paymentMethod} className='w-25' />
                    </div>
                </div>

                <Elements>
                    <Checkout user={this.props.user.user} />
                </Elements>
            </div>
        </StripeProvider>;

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
                            <UserInfo label='Github' value={this.props.user.user ? this.props.user.user.user_github : ''} type='user_github' status={userGithubStatus} />
                            <hr/>
                            <UserInfo label='Twitter' value={this.props.user.user ? this.props.user.user.user_twitter : ''} type='user_twitter' status={userTwitterStatus} />
                            <hr/>
                            <UserInfo label='Facebook' value={this.props.user.user ? this.props.user.user.user_facebook : ''} type='user_facebook' status={userFacebookStatus} />
                            <hr/>
                            <UserInfo label='Instagram' value={this.props.user.user ? this.props.user.user.user_instagram : ''} type='user_instagram' status={userInstagramStatus} />
                            <hr/>
                            <UserInfo label='LinkedIn' value={this.props.user.user ? this.props.user.user.user_linkedin : ''} type='user_linkedin' status={userLinkedInStatus} />
                            <hr/>
                            <UserInfo label='Website' value={this.props.user.user ? this.props.user.user.user_website : ''} type='user_website' status={userWebsiteStatus} />
                        </div>
                    </div>
                    
                    <div className='col-10'>
                        <NavLink to={`/user/${this.props.user.user ? this.props.user.user.username : ''}`}><h1>{this.props.user.user ? this.props.user.user.username : ''}</h1></NavLink>
                        {businessName}

                        <hr/>

                        {this.props.user.user.account_type === 'Listing' ? <ListSettings user={this.props.user} /> : payment}
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