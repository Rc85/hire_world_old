import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ListSettings from '../includes/page/ListSettings';
import { Elements, StripeProvider } from 'react-stripe-elements';
import { Redirect } from 'react-router-dom';
import Checkout from '../includes/page/Checkout';
import BusinessHoursSetting from '../includes/page/BusinessHoursSettings';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import Loading from '../utils/Loading';

class Listing extends Component {
    render() {
        if (this.props.user.status === 'getting session') {
            return <Loading size='7x' />
        } else if (this.props.user.status === 'error') {
            return <Redirect to='/' />;
        } else if (this.props.user.status === 'get session success' && this.props.user.user) {
            let payment = <TitledContainer title='Subscribe' bgColor='success' icon={<FontAwesomeIcon icon={faPlusSquare} />} shadow>
                <StripeProvider apiKey={process.env.REACT_ENV === 'development' ? 'pk_test_KgwS8DEnH46HAFvrCaoXPY6R' : 'pk_live_wJ7nxOazDSHu9czRrGjUqpep'}>
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

        return <Redirect to='/' />;
    }
}

Listing.propTypes = {
    user: PropTypes.object
};

export default Listing;