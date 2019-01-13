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
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

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
        let subscriptionInfo, unsubscribeButton, billingDate, nickname, price;

        if (this.props.user.user && this.props.user.user.is_subscribed) {
            unsubscribeButton = <React.Fragment><button id='unsubscribe-listing-button' className='btn btn-danger ml-1' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to unsubscribe?', false, {action: 'unsubscribe'}))}>Unsubscribe</button>
            <UncontrolledTooltip placement='top' target='unsubscribe-listing-button' delay={0}>Cancel your listing subscription</UncontrolledTooltip></React.Fragment>;
        }

        let now = new Date().getTime() / 1000;

        if (this.state.subscription && this.state.subscription.plan) {
            if (this.state.subscription.status === 'trialing') {
                billingDate = moment.unix(this.state.subscription.trial_end).format('MM-DD-YYYY');
            } else {
                billingDate = moment.unix(this.state.subscription.current_period_end).format('MM-DD-YYYY');
            }

            nickname = this.state.subscription.plan.nickname;
            price = <React.Fragment>
                ${this.state.subscription.plan.amount / 100} {this.state.subscription.plan.currency.toUpperCase()} / {this.state.subscription.plan.interval}
            </React.Fragment>


            if (this.state.subscription.status !== 'canceled' || this.state.subscription.current_period_end > now) {
                let subscriptionStatus;

                if (this.state.subscription.status === 'active' || this.state.subscription.status === 'trialing') {
                    subscriptionStatus = <span className='med-badge mini-badge-success'>Subscribed</span>;
                } else if (this.state.subscription.status === 'canceled') {
                    subscriptionStatus = <span className='med-badge mini-badge-danger'>Cancelled</span>
                }

                subscriptionInfo = <React.Fragment>
                    <div className='d-flex-between-center mb-3'>
                        <h4>{subscriptionStatus}</h4>
                        {unsubscribeButton}
                    </div>

                    <div className='setting-field-container'>
                        <div className='subscription-info'>
                            <label htmlFor='next-billing' className='mr-2'>{this.state.subscription.status !== 'canceled' ? 'Next Billing Date:' : 'Subscription End Date:'} </label>
                            {billingDate}
                        </div>

                        <div className='subscription-info'>
                            <label htmlFor='plan' className='mr-2'>Plan: </label>
                            {nickname}
                        </div>

                        <div className='subscription-info'>
                            <label htmlFor='price' className='mr-2'>Price: </label>
                            {price}
                        </div>
                    </div>

                    <hr/>
                </React.Fragment>
            }
        }

        // test key pk_test_KgwS8DEnH46HAFvrCaoXPY6R
        // live key pk_live_wJ7nxOazDSHu9czRrGjUqpep

        return (
            <section id='subscription-setting' className='main-panel'>
                <TitledContainer title='Subscription Setting' bgColor='orange' icon={<FontAwesomeIcon icon={faSyncAlt} />}>
                    {subscriptionInfo}
    
                    <span>Upgrading will have pro-rated credit applied to your next bill. See FAQ for more detail.</span>
    
                    <StripeProvider apiKey='pk_live_wJ7nxOazDSHu9czRrGjUqpep'>
                        <Elements>
                            <Checkout user={this.props.user.user} />
                        </Elements>
                    </StripeProvider>
                </TitledContainer>
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