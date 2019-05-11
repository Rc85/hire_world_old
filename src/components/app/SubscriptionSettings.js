import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StripeProvider, Elements } from 'react-stripe-elements';
import fetch from 'axios';
import { LogError } from '../utils/LogError';
import moment from 'moment';
import { GetSession } from '../../actions/FetchActions';
import { ShowConfirmation, ResetConfirmation } from '../../actions/ConfirmationActions';
import { connect } from 'react-redux';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faCalendarAlt, faCube, faBoxUsd } from '@fortawesome/pro-solid-svg-icons';
import { Redirect } from 'react-router-dom';
import Loading from '../utils/Loading';
import Tooltip from '../utils/Tooltip';
import VerifyPayment from '../includes/page/VerifyPayment';
import { ShowLoading, HideLoading } from '../../actions/LoadingActions';
import { UpdateUser } from '../../actions/LoginActions';
import InputWrapper from '../utils/InputWrapper';
import { Alert } from '../../actions/AlertActions';
import MoneyFormatter from '../utils/MoneyFormatter';

class SubscriptionSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Loading',
            subscription: {},
            plans: []
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.confirm.data) {
            if (this.props.confirm.data.action === 'unsubscribe' && this.props.confirm.option && this.props.confirm.option !== prevProps.confirm.option) {
                this.cancelSubscription();
                this.props.dispatch(ResetConfirmation());
            } else if (this.props.confirm.data.action === 'subscribe' && this.props.confirm.option && this.props.confirm.option !== prevProps.confirm.option) {
                this.subscribe(this.props.confirm.data.token, this.props.confirm.data.saveAddress);
                this.props.dispatch(ResetConfirmation());
            }
        }
    }

    componentDidMount() {
        fetch.post('/api/get/user/subscription')
        .then(resp => {
            console.log(resp);
            if (resp.data.status === 'success') {
                this.setState({status: '', subscription: resp.data.subscription, plans: resp.data.plans.data});
            } else if (resp.data.status === 'error') {
                this.setState({status: 'error'});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/user/subscription');
            this.setState({status: 'error'});
        });
    }

    subscribe(token, save) {
        this.props.dispatch(ShowLoading('Processing payment...'));

        fetch.post('/api/user/subscription/add', {...token, saveAddress: save, plan: this.state.plan})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: 'Success'});
                this.props.dispatch(UpdateUser());
            } else if (resp.data.status === 'error') {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }

            this.props.dispatch(HideLoading());
        })
        .catch(err => {
            LogError(err, '/api/user/payment/submit');
            this.props.dispatch(HideLoading());
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
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

    selectPlan(e) {
        let plan = this.state.plans.filter(plan => plan.id === e.target.value);

        this.setState({plan: e.target.value, planName: plan[0].nickname});
    }

    confirmSubscription(token, save) {
        if (!this.state.plan) {
            this.props.dispatch(Alert('error', 'Please choose a plan'));
        } else {
            this.props.dispatch(ShowConfirmation(`Are you sure you want to subscribe to the ${this.state.planName} plan?`, `This card will be used as the default payment method for this subscription`, {action: 'subscribe', token: token, saveAddress: save}))
        }
    }
    
    render() {
        if (this.state.status === 'Loading') {
            return <Loading size='7x' color='black' />;
        } else if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        } else if (this.state.status === 'error') {
            return <Redirect to='/error/app/500' />;
        } else if (this.state.status === 'Success') {
            return <Redirect to='/payment/success' />;
        }

        if (this.props.user.user) {
            let subscriptionInfo, unsubscribeButton, billingDate, nickname, price;

            if (this.props.user.user && this.props.user.user.is_subscribed) {
                unsubscribeButton = <Tooltip text='Cancel your listing subscription' placement='left'><button id='unsubscribe-listing-button' className='btn btn-danger ml-1' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to unsubscribe?', false, {action: 'unsubscribe'}))}>Unsubscribe</button></Tooltip>;
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
                    $<MoneyFormatter value={this.state.subscription.plan.amount / 100} /> {this.state.subscription.plan.currency.toUpperCase()} / {this.state.subscription.plan.interval}
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

                        <div className='d-flex'>
                            <div className='subscription-info mr-2'>
                                <FontAwesomeIcon icon={faCalendarAlt} className='text-special mr-1' /><strong>{this.state.subscription.status !== 'canceled' ? 'Next Billing Date:' : 'Subscription End Date:'}</strong> {billingDate}
                            </div>

                            <div className='subscription-info mr-2'>
                                <FontAwesomeIcon icon={faCube} className='text-special mr-1' /><strong>Plan:</strong> {nickname}
                            </div>

                            <div className='subscription-info mr-2'>
                                <div>
                                    <FontAwesomeIcon icon={faBoxUsd} className='text-special mr-1' /><strong>Price:</strong> {price}
                                </div>
                            </div>
                        </div>

                        <hr/>
                    </React.Fragment>
                }
            }

            if (this.state.status === 'Unsubscribed') {
                return <Redirect to='/subscription/cancelled' />
            }

            return (
                <section id='subscription-setting' className='main-panel'>
                    <TitledContainer title='Subscription' bgColor='orange' icon={<FontAwesomeIcon icon={faSyncAlt} />} shadow>
                        {subscriptionInfo}

                        {!this.props.user.user.is_subscribed ? <React.Fragment>
                            <InputWrapper label='Plans' required>
                                <select onChange={this.selectPlan.bind(this)}>
                                    <option value=''></option>
                                    {this.state.plans.map((plan) => {
                                        return <option key={plan.id} value={plan.id}>{plan.nickname} - ${(plan.amount / 100).toFixed(2)} {plan.currency.toUpperCase()}</option>
                                    })}
                                </select>
                            </InputWrapper>
            
                            <StripeProvider apiKey={process.env.REACT_ENV === 'production' ? 'pk_live_wJ7nxOazDSHu9czRrGjUqpep' : 'pk_test_KgwS8DEnH46HAFvrCaoXPY6R'}>
                                <Elements>
                                    <VerifyPayment
                                    user={this.props.user}
                                    submit={(token, save) => this.confirmSubscription(token, save)}
                                    status={this.props.status}
                                    />
                                </Elements>
                            </StripeProvider>
                        </React.Fragment> : ''}
                    </TitledContainer>
                </section>
            )
        }

        return <Loading size='7x' color='black' />;
    }
}

SubscriptionSettings.propTypes = {
    user: PropTypes.object
};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(SubscriptionSettings);