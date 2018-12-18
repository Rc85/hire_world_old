import React, { Component } from 'react';
import fetch from 'axios';
import { CardNumberElement, CardExpiryElement, CardCVCElement, injectStripe } from 'react-stripe-elements';
import { LogError } from '../../utils/LogError';
import { RegionDropdown, CountryDropdown } from 'react-country-region-selector';
import SubmitButton from '../../utils/SubmitButton';
import { Alert } from '../../../actions/AlertActions';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';
import Loading from '../../utils/Loading';
import { GetSession } from '../../../actions/FetchActions';

class Checkout extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: '',
            plan: 'plan_EAIyF94Yhy1BLB',
            name: '',
            defaultAddress: this.props.user.user_address ? true : false,
            saveAddress: false
        }
        
        this.submit = this.submit.bind(this);
    }
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data.action === 'submit payment' && nextProps.confirm.option) {
            this.submit();

            this.props.dispatch(ResetConfirmation());
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
        let { token } = await this.props.stripe.createToken({
            name: `${this.props.user.user_firstname} ${this.props.user.user_lastname}`
        });

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

    render() {
        let addressInput, status;

        if (this.state.status === 'Success') {
            return <Redirect to='/payment/success' />;
        } else if (this.state.status === 'Sending') {
            status = <Loading size='5x' />;
        }

        if (!this.state.defaultAddress) {
            addressInput = <div className='payment-address-parent'>
                <div className='payment-address-column'>
                    <div className='w-100 mb-3'>
                        <label htmlFor='address'>Address:</label>
                        <input type='text' name='address' id='address' className='form-control mb-3' onChange={(e) => this.setState({address: e.target.value})} required />
                    </div>
    
                    <div className='w-100 mb-3'>
                        <label htmlFor='country'>Country:</label>
                        <select name='country' id='country' className='form-control' onChange={(e) => this.setState({country: e.target.value})} required>
                            <option value=''>Select Country</option>
                            <option value='Canada'>Canada</option>
                            <option value='Mexico'>Mexico</option>
                            <option value='United States'>United States</option>
                        </select>
                    </div>

                    <div className='w-100'>
                        <label htmlFor='city_code'>Postal/Zip Code:</label>
                        <input type='text' name='city_code' id='city_code' className='form-control' onChange={(e) => this.setState({cityCode: e.target.value})} />
                    </div>
                </div>

                <div className='payment-address-column'>
                    <div className='w-100 mb-3'>
                        <label htmlFor='region'>Region:</label>
                        <RegionDropdown value={this.state.region} country={this.state.country} onChange={(val) => this.setState({region: val})} classes='form-control mb-3' required />
                    </div>
    
                    <div className='w-100 mb-3'>
                        <label htmlFor='city'>City:</label>
                        <input type='text' name='city' id='city' className='form-control mb-3' onChange={(e) => this.setState({city: e.target.value})} required />
                    </div>

                    <div className='w-100'>
                        <div>
                            <label htmlFor='save-address'><input type='checkbox' name='save-address' id='save-address' onClick={() => this.setState({saveAddress: !this.state.saveAddress})} defaultChecked={this.state.saveAddress} /> Save this address to your account</label>
                        </div>
                    </div>
                </div>
            </div>
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
                        <div className='w-100'>
                            <label htmlFor='fullname'>Name on Card:</label>
                            <input type='text' name='fullname' id='fullname' className='form-control' onChange={(e) => this.setState({name: e.target.value})} autoComplete='ccname' />
                        </div>

                        <div className='w-100'>
                            <label htmlFor='use-default-address'><input type='checkbox' name='use-default-address' id='use-default-address' defaultChecked={this.state.defaultAddress} onClick={() => this.useDefaultAddress()} /> Use address registered with this account</label>
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