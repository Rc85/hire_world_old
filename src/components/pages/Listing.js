import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ListSettings from '../includes/page/ListSettings';
import { Elements, StripeProvider } from 'react-stripe-elements';
import Checkout from '../includes/page/Checkout';
import BusinessHoursSetting from '../includes/page/BusinessHoursSettings';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';

class Listing extends Component {
    render() {
        if (this.props.user.user) {
            // test key pk_test_KgwS8DEnH46HAFvrCaoXPY6R
            // live key pk_live_wJ7nxOazDSHu9czRrGjUqpep
            let payment = <TitledContainer title='Subscribe' bgColor='success' icon={<FontAwesomeIcon icon={faPlusSquare} />}>
                <StripeProvider apiKey='pk_live_wJ7nxOazDSHu9czRrGjUqpep'>
                    <div id='payment-input'>To begin listing, you need to subscribe to a monthly plan.
                        <Elements>
                            <Checkout user={this.props.user.user} />
                        </Elements>
                    </div>
                </StripeProvider>
            </TitledContainer>;

            let subscriptionEndDate = new Date(this.props.user.user.subscription_end_date);
            let now = new Date();

            return (
                <section id='listing-settings' className='main-panel setting-field-container'>
                    <div className='setting-child'>{subscriptionEndDate > now ? <ListSettings user={this.props.user} /> : payment}</div>
                    
                    <div className='setting-child'><BusinessHoursSetting user={this.props.user} /></div>
                </section>
            );
        }

        return null;
    }
}

Listing.propTypes = {
    user: PropTypes.object
};

export default Listing;