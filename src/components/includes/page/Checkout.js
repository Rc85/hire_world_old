import React, { Component } from 'react';
import fetch from 'axios';
import { CardNumberElement, CardExpiryElement, CardCVCElement, injectStripe } from 'react-stripe-elements';
import { LogError } from '../../utils/LogError';
import SubmitButton from '../../utils/SubmitButton';
import { Alert } from '../../../actions/AlertActions';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';
import Loading from '../../utils/Loading';
import { GetSession } from '../../../actions/FetchActions';
import AddressInput from '../../utils/AddressInput';

class Checkout extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: '',
            plan: 'plan_EAIyF94Yhy1BLB',
            name: '',
            defaultAddress: this.props.user.user_address && this.props.user.user_city && this.props.user.user_region && this.props.user.user_country && this.props.user.user_city_code ? true : false,
            saveAddress: false
        }
        
        this.submit = this.submit.bind(this);
    }
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data) {
            if (nextProps.confirm.data.action === 'submit payment' && nextProps.confirm.option) {
                this.submit();

                this.props.dispatch(ResetConfirmation());
            }
        }
    }
    
    useDefaultAddress() {
        if (this.props.user.user_address && this.props.user.user_city && this.props.user.user_region && this.props.user.user_country && this.props.user.user_city_code) {
            this.setState({defaultAddress: !this.state.defaultAddress, saveAddress: false});
            
        } else {
            this.props.dispatch(Alert('error', 'No address to use'));
        }
    }
    
    async submit() {
        let { token } = await this.props.stripe.createToken({name: this.state.name});

        this.setState({status: 'Sending'});

        let data = Object.assign({}, this.state);
        data['token'] = token;

        fetch.post('/api/user/payment/submit', data)
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: 'Success'});
                this.props.dispatch(GetSession());
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/user/payment/submit'));
    }

    set(key, val) {
        let obj = {};
        obj[key] = val;

        this.setState(obj);
    }

    render() {
        let addressInput, status;

        if (this.state.status === 'Success') {
            return <Redirect to='/payment/success' />;
        } else if (this.state.status === 'Sending') {
            status = <Loading size='5x' />;
        }

        if (!this.state.defaultAddress) {
            addressInput = <AddressInput info={this.state} saveable={true} set={(key, val) => this.set(key, val)} />;
        }

        return (
            <div className='checkout mt-3'>
                {status}
                <div className='d-flex-between-center'>
                    <label htmlFor='choose-plan' className='w-30'>Choose a Plan:</label>
                    <select name='plan' id='choose-plan' className='form-control mb-3' onChange={(e) => this.setState({plan: e.target.value})}>
                        <option value='plan_EAIyF94Yhy1BLB'>Listing - $7/month</option>
                    </select>
                </div>

                <div className='d-flex-between-start mb-3'>
                    <div className='w-45'>
                        <div className='w-100 mb-3'>
                            <label htmlFor='fullname'>Name on Card:</label>
                            <input type='text' name='fullname' id='fullname' className='form-control' onChange={(e) => this.setState({name: e.target.value})} autoComplete='ccname' />
                        </div>

                        <div className='w-100'>
                            <label htmlFor='use-default-address'><input type='checkbox' name='use-default-address' id='use-default-address' checked={this.state.defaultAddress} onClick={() => this.useDefaultAddress()} /> Use address registered with this account</label>
                        </div>
                    </div>

                    <div className='d-flex-between-center w-45'>
                        <div className='w-55'>
                            <label htmlFor='card-number'>Credit Card Number:</label>
                            <CardNumberElement className='form-control' />
                        </div>
    
                        <div className='w-20'>
                            <label htmlFor='expiry-date'>Expirty Date:</label>
                            <CardExpiryElement className='form-control' />
                        </div>
    
                        <div className='w-20'>
                            <label htmlFor='cvc'>CVC:</label>
                            <CardCVCElement className='form-control' />
                        </div>
                    </div>
                </div>

                {addressInput}

                <div className='text-right'><SubmitButton type='button' loading={this.state.status === 'Sending'} onClick={() => this.props.dispatch(ShowConfirmation(`Are you sure you want to subscribe to this monthly plan?`, `You will be charged immediately and there will be no refunds`, {action: 'submit payment'}))} /></div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(injectStripe(Checkout));