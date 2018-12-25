import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ListSettings from '../includes/page/ListSettings';
import { Elements, StripeProvider } from 'react-stripe-elements';
import Checkout from '../includes/page/Checkout';
import BusinessHoursSetting from '../includes/page/BusinessHoursSettings';

class Listing extends Component {
    render() {
        let payment = <StripeProvider apiKey='pk_test_KgwS8DEnH46HAFvrCaoXPY6R'>
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

        return (
            <section id='subscription-settings' className='blue-panel shallow three-rounded'>

                {this.props.user.user.account_type === 'Listing' ? <ListSettings user={this.props.user} /> : payment}

                <hr/>

                <BusinessHoursSetting user={this.props.user} />
            </section>
        );
    }
}

Listing.propTypes = {
    user: PropTypes.object
};

export default Listing;