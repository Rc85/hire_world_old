import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ListSettings from '../includes/page/ListSettings';
import { Elements, StripeProvider } from 'react-stripe-elements';
import Checkout from '../includes/page/Checkout';
import BusinessHoursSetting from '../includes/page/BusinessHoursSettings';

class Listing extends Component {
    render() {
        // test key pk_test_KgwS8DEnH46HAFvrCaoXPY6R
        // live key pk_live_wJ7nxOazDSHu9czRrGjUqpep
        let payment = <StripeProvider apiKey='pk_live_wJ7nxOazDSHu9czRrGjUqpep'>
            <div id='payment-input'>
                <div className='d-flex-between-center'>
                    <div className='w-50'>To begin listing, you need to subscribe to a monthly plan.</div>

                    <div className='text-right w-50'>
                        <img src='/images/powered_by_stripe.png' className='w-25 mr-1' />
                        <img src='/images/payment_methods.png' className='w-25' />
                    </div>
                </div>

                <Elements>
                    <Checkout user={this.props.user.user} />
                </Elements>
            </div>
        </StripeProvider>;

        let subscriptionEndDate = new Date(this.props.user.user.subscription_end_date);
        let now = new Date();

        return (
            <section id='listing-settings' className='main-panel setting-panel-container'>
                <div className='setting-child'>{subscriptionEndDate > now ? <ListSettings user={this.props.user} /> : payment}</div>

                <div className='setting-child'><BusinessHoursSetting user={this.props.user} /></div>
            </section>
        );
    }
}

Listing.propTypes = {
    user: PropTypes.object
};

export default Listing;