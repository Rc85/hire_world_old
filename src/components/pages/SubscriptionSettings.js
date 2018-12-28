import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StripeProvider, Elements } from 'react-stripe-elements';
import Checkout from '../includes/page/Checkout';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import moment from 'moment';
import { GetSession } from '../../actions/FetchActions';
import { ShowConfirmation, ResetConfirmation } from '../../actions/ConfirmationActions';
import { UncontrolledTooltip } from 'reactstrap';
import { connect } from 'react-redux';
import { Keys } from '../utils/Keys';

class SubscriptionSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            subscription: {}
        }
    }
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data) {
            if (nextProps.confirm.data.action === 'unsubscribe' && nextProps.confirm.option) {
                this.cancelSubscription();
                this.props.dispatch(ResetConfirmation());
            }
        }
    }

    componentDidMount() {
        fetch.post('/api/get/user/subscription')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({subscription: resp.data.subscription});
            }
        })
        .catch(err => LogError(err, '/api/get/user/subscription'));
    }

    cancelSubscription() {
        this.setState({status: 'Loading'});

        fetch.post('/api/user/subscription/cancel')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: 'Unsubscribed'});
                this.props.dispatch(GetSession());
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/user/subscription/cancel'));
    }
    
    render() {
        console.log(this.state);
        let subscriptionInfo, unsubscribeButton;

        if (this.props.user.user && this.props.user.user.is_subscribed) {
            unsubscribeButton = <React.Fragment><button id='unsubscribe-listing-button' className='btn btn-danger ml-1' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to unsubscribe?', false, {action: 'unsubscribe'}))}>Unsubscribe</button>
            <UncontrolledTooltip placement='top' target='unsubscribe-listing-button' delay={0}>Cancel your listing subscription</UncontrolledTooltip></React.Fragment>;
        }

        if (this.state.subscription) {
            let subscriptionStatus;

            if (this.state.subscription.status === 'active' || this.state.subscription.status === 'trialing') {
                subscriptionStatus = <span className='badge badge-success'>Subscribed</span>;
            } else if (this.state.subscription.status === 'canceled') {
                subscriptionStatus = <span className='badge badge-danger'>Cancelled</span>
            }

            subscriptionInfo = <React.Fragment>
                <div className='d-flex-between-center mb-3'>
                    <h4>{subscriptionStatus}</h4>
                    {unsubscribeButton}
                </div>

                <div className='d-flex-between-center'>
                    <div className='w-33'>
                        <label htmlFor='next-billing' className='mr-2'>{this.state.subscription.status !== 'canceled' ? 'Next Billing Date:' : 'Subscription End Date:'} </label>
                        {this.state.subscription.status === 'trialing' ? moment.unix(this.state.subscription.trial_end).format('MM-DD-YYYY') : moment.unix(this.state.subscription.current_period_end).format('MM-DD-YYYY')}
                    </div>

                    <div className='w-33 text-center'>
                        <label htmlFor='plan' className='mr-2'>Plan: </label>
                        {this.state.subscription.plan ? this.state.subscription.plan.nickname : ''}
                    </div>

                    <div className='w-33 text-right'>
                        <label htmlFor='price' className='mr-2'>Price: </label>
                        ${this.state.subscription.plan ? this.state.subscription.plan.amount / 100 : ''} {this.state.subscription.plan ? this.state.subscription.plan.currency.toUpperCase() : ''} / {this.state.subscription.plan ? this.state.subscription.plan.interval : ''}
                    </div>
                </div>

                <hr/>
            </React.Fragment>
        }

        return (
            <section id='subscription-setting' className='blue-panel three-rounded shallow'>
                {subscriptionInfo}

                <span>Upgrading and downgrading plans will have pro-rated charges or credit applied to your next bill. See FAQ for more detail.</span>

                <StripeProvider apiKey={Keys.STRIPE_API_KEY}>
                    <Elements>
                        <Checkout user={this.props.user.user} />
                    </Elements>
                </StripeProvider>
            </section>
        );
    }
}

SubscriptionSettings.propTypes = {

};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(SubscriptionSettings);