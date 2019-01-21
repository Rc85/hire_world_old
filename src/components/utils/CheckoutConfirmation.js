import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { HideConfirmation } from '../../actions/ConfirmationActions';

class CheckoutConfirmation extends Component {
    componentDidMount() {
        let modal = document.getElementById('confirmation-modal');
        modal.style.top = `${window.pageYOffset}px`;
        document.body.style.overflowY = 'hidden';
    }

    confirmation(bool) {
        this.props.dispatch(HideConfirmation(bool, this.props.data));
        document.body.style.overflowY = 'auto';
    }

    render() {
        let planName, price, calcStripeFee, stripeFee, offsetStripeFee;

        // live plan id plan_EFVAGdrFIrpHx5
        // test plan id plan_EAIyF94Yhy1BLB
        //if (this.props.info.plan === 'plan_EAIyF94Yhy1BLB') {
            planName = 'Listing Account';
            price = 7.00;
            calcStripeFee = Math.round((price * 0.029) * 100);
            stripeFee = calcStripeFee / 100;
            offsetStripeFee = 0.02;
        //}

        return (
            <div id='confirmation-modal' className='full-black-overlay'>
                <div className='modal-container rounded'>
                    <div className='modal-text mb-3'>
                        Please review and confirm that the information below is correct.

                        <div className='bordered-container'>
                            <div className='d-flex-between-center border-bottom border-dark'>
                                <div className='w-75'>{planName}</div>
                                <div className='w-25 text-right'>${price % 1 === 0 ? price.toString() + '.00' : price}</div>
                            </div>

                            <div className='d-flex-between-center'>
                                <div className='w-75'>Stripe Fee (2.9%)</div>
                                <div className='w-25 text-right'>${stripeFee % 0.1 === 0 ? stripeFee.toString() + '0' : stripeFee}</div>
                            </div>

                            <div className='d-flex-between-center'>
                                <div className='w-100 text-right'>$0.30</div>
                            </div>

                            <div className='d-flex-between-center border-bottom border-dark'>
                                <div className='w-75'>Offset Fee</div>
                                <div className='w-25 text-right'>${offsetStripeFee}</div>
                            </div>
                            
                            <div className='d-flex-between-center'>
                                <div className='w-75'>GST</div>
                                <div className='w-25 text-right'>$0.00</div>
                            </div>

                            <div className='d-flex-between-center'>
                                <div className='w-75'>PST</div>
                                <div className='w-25 text-right'>$0.00</div>
                            </div>

                            <div className='d-flex-between-center border-bottom border-dark'>
                                <div className='w-75'>Shipping</div>
                                <div className='w-25 text-right'>$0.00</div>
                            </div>

                            <div className='d-flex-between-center'>
                                <div className='w-75'>Subtotal</div>
                                <div className='w-25 text-right'>${(price + stripeFee + 0.30 + offsetStripeFee) % 0.1 < 0.1 && (price + stripeFee + 0.30 + offsetStripeFee) % 0.1 > 0.09 ? (price + stripeFee + 0.30).toString() + '0' : price + stripeFee + 0.30 + offsetStripeFee} CAD</div>
                            </div>

                            <div className='d-flex-between-center'>
                                <div className='w-75'>Total</div>
                                <div className='w-25 text-right'>${(price + stripeFee + 0.30 + offsetStripeFee) % 0.1 < 0.1 && (price + stripeFee + 0.30 + offsetStripeFee) % 0.1 > 0.09 ? (price + stripeFee + 0.30).toString() + '0' : price + stripeFee + 0.30 + offsetStripeFee} CAD</div>
                            </div>
                        </div>

                        <div><small className='mb-2'>Reminder: The amount indicated above will not be charged until your subscription end date is reached.</small></div>

                        <div><small>Note: The Offset Fee is to offset the Stripe charges on the total amount. See FAQ for more details.</small></div>
                    </div>

                    <div className='text-right'>
                        <button className='btn btn-primary mr-1' onClick={() => {this.confirmation(true)}}>Pay</button>
                        <button className='btn btn-secondary' onClick={() => {this.confirmation(false)}}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    }
}

CheckoutConfirmation.propTypes = {
    info: PropTypes.object
};

const mapStateToProps = state => {
    return {
        data: state.Confirmation.data
    }
}

export default connect(mapStateToProps)(CheckoutConfirmation);