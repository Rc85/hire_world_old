import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from '../../../actions/AlertActions';
import { LogError } from '../../utils/LogError';
import fetch from 'axios';
import { connect } from 'react-redux';
import NewPaymentForm from './NewPaymentForm';
import AddressInput from './AddressInput';
import { injectStripe } from 'react-stripe-elements';
import InputWrapper from '../../utils/InputWrapper';
import SubmitButton from '../../utils/SubmitButton';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';
import Loading from '../../utils/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/pro-solid-svg-icons';

class VerifyPayment extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: 'Getting Payments',
            payments: [],
            defaultAddress: this.props.user.user.user_address && this.props.user.user.user_city && this.props.user.user.user_region && this.props.user.user.user_country && this.props.user.user.user_city_code ? true : false,
            usePayment: null
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.confirm.data) {
            if (this.props.confirm.data.action === 'submit' && this.props.confirm.option) {
                this.submit();
                this.props.dispatch(ResetConfirmation());
            }
        }
    }
    
    componentDidMount() {
        fetch.post('/api/get/user/payments', {user: this.props.user.user.username})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', payments: resp.data.payments});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => {
            LogError(err, '/api/get/user/payments/bank');
            this.setState({status: ''});
            this.props.dispatch(Alert('error', 'An error occurred'));
        });
    }

    useDefaultAddress() {
        if (!this.props.user.user.user_address || !this.props.user.user.user_city || !this.props.user.user.user_region || !this.props.user.user.user_country || !this.props.user.user.user_city_code) {
            this.props.dispatch(Alert('error', 'No address to use'));
        } else {
            this.setState({defaultAddress: !this.state.defaultAddress, saveAddress: false});
        }
    }

    set(key, val) {
        let obj = {};
        obj[key] = val;

        this.setState(obj);
    }

    async submit() {
        let token = {};

        if (this.state.usePayment && this.state.usePayment !== 'New') {
            token['token'] = {}
            token['token']['id'] = this.state.usePayment;
        } else {
            token = await this.props.stripe.createToken({
                name: this.state.name ? this.state.name : `${this.props.user.user_firstname} ${this.props.user.user_lastname}`,
                address_line1: this.state.defaultAddress ? this.props.user.user_address : this.state.address_line1,
                address_city: this.state.defaultAddress ? this.props.user.user_city : this.state.address_city,
                address_state: this.state.defaultAddress ? this.props.user.user_region : this.state.address_state,
                address_zip: this.state.defaultAddress ? this.props.user.user_city_code : this.state.address_zip,
                address_country: this.state.defaultAddress ? this.props.user.user_country : this.state.address_country
            });
        }

        this.props.submit(token, this.state.saveAddress)
    }
    
    render() {
        let payments, addressInput;

        if (this.state.status === 'Getting Payments') {
            return <div className='text-center'><FontAwesomeIcon icon={faCircleNotch} size='7x' spin /></div>;
        }

        if (this.state.payments.length > 0) {
            payments = this.state.payments.map((payment, i) => {
                return <option key={payment.id} value={payment.id}>{payment.brand} {payment.funding.charAt(0).toUpperCase() + payment.funding.substr(1)} **** **** **** {payment.last4}</option>
            });
        }

        if (!this.state.defaultAddress) {
            addressInput = <AddressInput info={this.state} saveable={true} set={(key, val) => this.set(key, val)} required />;
        }

        return (
            <div id='verify-payment'>
                <div className='simple-container no-bg mb-3'>
                    <div className='simple-container-title'>Verify Payment</div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        this.submit();
                        //this.props.dispatch(ShowConfirmation(`Are you sure you want to accept this job?`, `The funds for the first milestone will be transferred from your selected payment method.`, {action: 'submit'}))
                    }}>
                        <div className='mb-3'>
                            {payments ? <InputWrapper label='Payment Methods'>
                                <select onChange={(e) => this.setState({usePayment: e.target.value})} required>
                                    <option value=''>Select a payment method</option>
                                    {payments}
                                    <option value='New'>New payment method...</option>
                                </select>
                            </InputWrapper> :
                            <React.Fragment>
                                <NewPaymentForm name={(val) => this.setState({name: val})} useDefaultAddress={() => this.useDefaultAddress()} defaultAddress={this.state.defaultAddress} setExpRef={(el) => this.CardExpiryElement = el} setCardRef={(el) => this.CardNumberElement = el} setCvcRef={(el) => this.CardCVCElement = el} />
                                {addressInput}
                            </React.Fragment>
                            }

                            {this.state.usePayment === 'New' ? <React.Fragment>
                                <NewPaymentForm name={(val) => this.setState({name: val})} useDefaultAddress={() => this.useDefaultAddress()} defaultAddress={this.state.defaultAddress} setExpRef={(el) => this.CardExpiryElement = el} setCardRef={(el) => this.CardNumberElement = el} setCvcRef={(el) => this.CardCVCElement = el} />
                                {addressInput}
                            </React.Fragment> : ''}
                        </div>

                        <div className='text-right'>
                            <SubmitButton type='submit' loading={this.props.status === 'Verifying'} />
                            {this.props.decline ? <button className='btn btn-danger' type='button'>Decline</button> : ''}
                            {this.props.back ? <button className='btn btn-secondary' type='button' onClick={() => this.props.back()}>Back</button> : ''}
                            {this.props.cancel ? <button className='btn btn-secondary' type='button' onClick={() => this.props.cancel()}>Cancel</button> : ''}
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

VerifyPayment.propTypes = {

};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(injectStripe(VerifyPayment));