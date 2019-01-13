import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Alert } from '../../../actions/AlertActions';
import SubmitButton from '../../utils/SubmitButton';
import { UncontrolledTooltip } from 'reactstrap';
import moment from 'moment';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';
import { connect } from 'react-redux';
import InputWrapper from '../../utils/InputWrapper';
import Tooltip from '../../utils/Tooltip';
import InputGroup from '../../utils/InputGroup';

class OfferSender extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            price: 0,
            currency: '',
            numberOfPayments: 0,
            date: null,
            term: '',
            offerType: '',
            paymentType: '',
            amountType: '',
            paymentPeriod: '',
            payments: [],
            status: '',
            statusMessage: '',
            offerTypeTooltip: null,
            confidential: false,
            confirmConfidentiality: false
        }

        this.selectDate = this.selectDate.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data && nextProps.confirm.data.action === 'set confidential' && nextProps.confirm.option) {
            this.setState({
                price: 0,
                currency: '',
                numberOfPayments: 0,
                date: null,
                term: '',
                offerType: '',
                paymentType: '',
                amountType: '',
                paymentPeriod: '',
                payments: [],
                status: '',
                statusMessage: '',
                offerTypeTooltip: null,
                confidential: !this.state.confidential,
                confirmConfidentiality: false
            });

            this.props.dispatch(ResetConfirmation());
        } else if (nextProps.confirm.data && nextProps.confirm.data.action === 'delete offer' && nextProps.confirm.option) {
            this.props.delete();
            this.props.dispatch(ResetConfirmation());
        }
    }
    

    componentDidMount() {
        if (this.props.offer) {
            let paymentArray = [];

            if (this.props.offer.offer_payment_1) {
                paymentArray.push(parseFloat(this.props.offer.offer_payment_1));
            }

            if (this.props.offer.offer_payment_2) {
                paymentArray.push(parseFloat(this.props.offer.offer_payment_2));
            }

            if (this.props.offer.offer_payment_3) {
                paymentArray.push(parseFloat(this.props.offer.offer_payment_3));
            }

            if (this.props.offer.offer_payment_4) {
                paymentArray.push(parseFloat(this.props.offer.offer_payment_4));
            }

            if (this.props.offer.offer_payment_5) {
                paymentArray.push(parseFloat(this.props.offer.offer_payment_5));
            }

            if (this.props.offer.offer_payment_6) {
                paymentArray.push(parseFloat(this.props.offer.offer_payment_6));
            }

            this.setState({
                price: parseFloat(this.props.offer.offer_price),
                currency: this.props.offer.offer_currency,
                numberOfPayments: this.props.offer.offer_number_of_payments,
                date: this.props.offer.completed_by ? moment(this.props.offer.completed_by) : null,
                term: this.props.offer.offer_term,
                offerType: this.props.offer.offer_type,
                paymentType: this.props.offer.offer_payment_type,
                amountType: this.props.offer.offer_amount_type,
                paymentPeriod: this.props.offer.offer_payment_period,
                payments: paymentArray,
                confidential: this.props.offer.offer_confidentiality,
            });
        }
    }

    selectDate(date) {
        this.setState({date: date});
    }

    setOfferType(val) {
        let tooltip; 

        if (val === 'Contract Term') {
            tooltip = `A contract term specifies that a job is for a duration agreed upon you and the other party.`;
        } else if (val === 'Iteration') {
            tooltip = `Iteration is for jobs that have a number of milestones or payments throughout the job term.`;
            
            this.setState({paymentType: 'Fixed'});
        } else if (val === 'Per Delivery') {
            tooltip = `Per delivery is for jobs that have a one-time payment per service or product.`;

            this.setState({paymentType: 'Fixed'});
        } else if (!val) {
            tooltip = null;
        }

        this.setState({offerType: val, offerTypeTooltip: tooltip});
    }

    setNumberOfPayments(i) {
        let num = parseInt(i);
        let arr;

        if (num > 6) {
            arr = new Array(6).fill('0')

            if (this.state.price && this.state.amountType === 'Equally') {
                arr = this.calculatePayments(6, this.state.price);
            }

            this.setState({numberOfPayments: 6, payments: arr});
            this.props.dispatch('error', 'Maximum 6 payments allowed');
        } else if (num >= 0 && num <= 6) {
            arr = new Array(num).fill('0')

            if (this.state.price && this.state.amountType === 'Equally') {
                arr = this.calculatePayments(num, this.state.price);
            } else if (this.state.amountType === 'Varies') {
                arr = [...this.state.payments];
                let indexToAdd = num - arr.length;

                if (indexToAdd >= 0) {
                    let newArr = new Array(indexToAdd).fill('0');
                    arr = [...arr, ...newArr];
                } else {
                    arr.pop()
                }
            }

            this.setState({numberOfPayments: num, payments: arr});
        } else {
            this.setState({numberOfPayments: 0});
            this.props.dispatch('error', 'Cannot go below zero');
        }
    }

    setPaymentType(val) {
        if (val === 'Hourly') {
            this.setState({paymentType: val, numberOfPayments: 0, payments: [], paymentPeriod: 'Bi-weekly'});
        } else if (val === 'Fixed') {
            this.setState({paymentType: val, paymentPeriod: null});
        } else {
            this.setState({paymentType: val, numberOfPayments: 0, payments: [], paymentPeriod: ''});
        }
    }

    modifyPayment(index, value) {
        let paymentArray = [...this.state.payments];

        paymentArray[index] = parseFloat(value);
        
        this.setState({payments: paymentArray});
    }

    setAmountType(val) {
        let arr = new Array(this.state.numberOfPayments).fill('0');
        
        if (val === 'Equally') {
            if (this.state.price) {
                let paymentArray = this.calculatePayments(this.state.numberOfPayments, this.state.price);

                if (paymentArray) {
                    arr = paymentArray;
                }
            }

            this.setState({amountType: val, payments: arr});
        } else {
            this.setState({amountType: val});
        }
    }

    calculatePayments(n, p) {
        let num = parseInt(n);
        let priceArray = new Array(num);

        if (p) {
            let price = parseFloat(p);
            let subtotal = 0;

            for (let i = 0; i < num; i++) {
                let pricePart = price / num;
                let rounded = Math.floor(pricePart * 100) / 100;
                priceArray[i] = rounded;
            }

            for (let price of priceArray) {
                subtotal = subtotal + price;
                subtotal = Math.round(subtotal * 100) / 100;
            }

            let diff = Math.round((price - subtotal) * 100) / 100;
            
            if (diff > 0) {
                let lastItem = priceArray.pop();
                let last = Math.floor((lastItem + diff) * 100) / 100;
                
                if (!isNaN(last)) {
                    priceArray.push(last);
                }
            }

            return priceArray;
        } else {
            this.setState({payments: priceArray});
            this.props.dispatch(Alert('error', 'Price or number of payments not set'));
        }
    }

    convertPayment(index) {
        let arr = [...this.state.payments];
        let percent = parseFloat(arr[index]) / 100;
        let rounded = Math.round((this.state.price * percent) * 100) / 100;
        arr[index] = rounded;

        this.setState({payments: arr});
    }

    submit() {
        if (!this.state.confidential) {
            let error = false;

            if (this.state.paymentType === 'Fixed' && this.state.payments.length > 0) {
                let total = 0;

                for (let payment of this.state.payments) {
                    total = total + payment;
                }

                let subtotal = Math.round(total * 100);
                total = subtotal / 100;

                if (total !== this.state.price) {
                    error = true;
                    this.props.dispatch(Alert('error', 'Total payments must equal to offer price'));
                }
            }
            
            if (this.state.offerType !== 'Contract Term' && this.state.offerType !== 'Iteration' && this.state.offerType !== 'Per Delivery') {
                error = true;
                this.props.dispatch(Alert('error', 'Offer type cannot be blank'));
            }

            if (/^\s*$/.test(this.state.price)) {
                error = true;
                this.props.dispatch(Alert('error', 'Please set an offer price'));
            }
            
            if (this.state.price && !this.state.currency) {
                error = true;
                this.props.dispatch(Alert('error', 'Please enter a currency'));
            }
            
            if (this.state.price && !this.state.paymentType) {
                error = true;
                this.props.dispatch(Alert('error', 'Please select a payment type'));
            }

            if (!error) {
                this.props.submit(this.state);
            }
        } else {
            this.props.submit(this.state);
        }
    }

    setOfferPrice(p) {
        let priceArray = [...this.state.payments];
        let price = 0;

        if (!isNaN(parseFloat(p))) {
            price = parseFloat(p);
        }
        
        if (this.state.amountType === 'Equally') {
            if (price && this.state.numberOfPayments > 0) {
                priceArray = this.calculatePayments(this.state.numberOfPayments, price);
            }
        }
        
        this.setState({price: price, payments: priceArray});
    }
    
    render() {
        console.log(this.state);
        let fixedSettings, offerTypeSetting, hourlySettings, paymentSettings, deleteButton, paymentType;

        if (this.state.offerType === 'Contract Term') {
            paymentType = <InputWrapper label='Payment Type'>
                <select name='payment_type' id='payment-type' onChange={(e) => this.setPaymentType(e.target.value)} disabled={this.state.confidential} value={this.state.paymentType} >
                    <option value=''>-</option>
                    <option value='Hourly'>Hourly</option>
                    <option value='Fixed'>Fixed</option>
                </select>
            </InputWrapper>
        }

        if (this.state.paymentType === 'Fixed') {
            fixedSettings = <FixedSettings set={(val) => this.setNumberOfPayments(val)} calculate={(val) => this.setAmountType(val)} disabled={this.state.confidential} amountType={this.state.amountType} numPayments={this.state.numberOfPayments} />;
        } else if (this.state.paymentType === 'Hourly') {
            hourlySettings = <InputWrapper label='Payment Period'><HourlySettings set={(val) => this.setState({paymentPeriod: val})} disabled={this.state.confidential} /></InputWrapper>;
        }

        if (this.state.offerType === 'Contract Term') {
            offerTypeSetting = <InputWrapper label='Term/Duration'>
                <input type='text' name='term' placeholder='3 months, 1 year, etc.' onChange={(e) => this.setState({term: e.target.value})} disabled={this.state.confidential} />
            </InputWrapper>;
        } else if (this.state.offerType === 'Iteration') {
            offerTypeSetting = <InputWrapper label='Must Be Completed By:'>
                <DatePicker dropdownMode='select' selected={this.state.date} onChange={this.selectDate} placeholderText='Leave blank if not applicable' disabled={this.state.confidential} />
            </InputWrapper>;
        }

        if (this.state.payments.length > 0) {
            paymentSettings = <InputGroup label='Payments' style='column'>
                {this.state.payments.map((input, i) => {
                    return <PaymentInput key={i} index={i} value={input} editable={this.state.amountType === 'Varies'} set={(val) => this.modifyPayment(i, val)} calculate={() => this.convertPayment(i)} disabled={this.state.confidential} />
                })}
            </InputGroup>
        }

        if (this.props.offer) {
            deleteButton = <button className='btn btn-danger ml-1' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to delete this offer?', 'This action cannot be reverted', {action: 'delete offer'}))}>Delete</button>
        }

        return (
            <div>
                <div className='make-offer-field-container'>
                    <div className='make-offer-field-half'>
                        <Tooltip text={this.state.offerTypeTooltip} placement='top-left' hide={!this.state.offerTypeTooltip}>
                            <InputWrapper label='Offer Type'>
                                <select name='offer_type' id='offer-type' onChange={(e) => this.setOfferType(e.target.value)} disabled={this.state.confidential} value={this.state.offerType} >
                                    <option value=''>-</option>
                                    <option value='Contract Term'>Contract Term</option>
                                    <option value='Iteration'>Iteration</option>
                                    <option value='Per Delivery'>Per Delivery</option>
                                </select>
                            </InputWrapper>
                        </Tooltip>
                        {/* <select name='offer_type' id='offer-type' onChange={(e) => this.setOfferType(e.target.value)} disabled={this.state.confidential} value={this.state.offerType} >
                            <option value=''>-</option>
                            <option value='Contract Term'>Contract Term</option>
                            <option value='Iteration'>Iteration</option>
                            <option value='Per Delivery'>Per Delivery</option>
                        </select> */}
                    </div>

                    {offerTypeSetting}
                </div>

                <div className='make-offer-field-container'>
                    <div className='make-offer-field-half'>
                        <InputWrapper label='Offer Price'>
                            <span className='price-input-sign'>$</span>

                            <input type='number' name='price' id='price-input' className='w-60' onChange={(e) => this.setOfferPrice(e.target.value)} disabled={this.state.confidential} value={this.state.price} min='0' />
    
                            <input type='text' name='currency' id='currency-input' className='w-40' list='currency-list' maxLength='5' placeholder='Currency' style={{borderTopRightRadius: '0.25rem', borderBottomRightRadius: '0.25rem'}} onChange={(e) => this.setState({currency: e.target.value})} disabled={this.state.confidential} value={this.state.currency} />
                            <datalist id='currency-list'>
                                <option value='USD'>USD</option>
                                <option value='CAD'>CAD</option>
                                <option value='AUD'>AUD</option>
                                <option value='EUR'>EUR</option>
                                <option value='GBP'>GBP</option>
                                <option value='CNY'>CNY</option>
                                <option value='JPY'>JPY</option>
                            </datalist>
                        </InputWrapper>
                    </div>

                    <div className='make-offer-field-quarter'>
                        {paymentType}
                    </div>

                    <div className='make-offer-field-quarter'>
                        {hourlySettings}
                    </div>
                </div>

                <div className='make-offer-field-container'>
                    <div className='make-offer-field-quarter'>{fixedSettings}</div>

                    <div id='payment-input-container' className='make-offer-field-three-quarter'>
                        {paymentSettings}
                    </div>
                </div>

                <div className='mb-1'>
                    <input type='checkbox' id='disable-all' checked={this.state.confidential} />
                    <label htmlFor='disable-all' onClick={() => {
                        if (!this.state.confidential) {
                            this.props.dispatch(ShowConfirmation(`This will erase everything you've entered.`, false, {action: 'set confidential'}));
                        } else {
                            this.setState({confidential: false});
                        }
                    }}> I want the offer detail to remain confidential between me and the other party.</label>
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value={this.props.offer ? 'Update' : 'Submit'} onClick={() => this.submit()} loading={this.state.status === 'Loading'} />
                    <button className='btn btn-secondary' onClick={() => this.props.cancel()}>Cancel</button>
                    {deleteButton}
                </div>
            </div>
        );
    }
}

const FixedSettings = props => {
    return(
        <React.Fragment>
            <div className='mb-3'><InputWrapper label='Number of Payments'><input type='number' name='payments' id='input-payment-num' onChange={(e) => props.set(e.target.value)} placeholder='Maximum of 6' min='0' max='6' disabled={props.disabled} value={props.numPayments} /></InputWrapper></div>

            <InputWrapper label='Calculation'>
                <select name='amount_type' id='amount-type' onChange={(e) => props.calculate(e.target.value)} disabled={props.disabled} value={props.amountType}>
                    <option value=''>-</option>
                    <option value='Equally'>Equally</option>
                    <option value='Varies'>Varies</option>
                </select>
            </InputWrapper>
        </React.Fragment>
    )
}

const HourlySettings = props => {
    return(
        <React.Fragment>
            <select name='payment_period' id='payment-period' onChange={(e) => props.set(e.target.value)} defaultValue='Bi-weekly' disabled={props.disabled}>
                <option value='Daily'>Daily</option>
                <option value='Weekly'>Weekly</option>
                <option value='Bi-weekly'>Bi-weekly</option>
                <option value='Monthly'>Monthly</option>
                <option value='Not applicable'>Not applicable</option>
            </select>
        </React.Fragment>
    )
}

const PaymentInput = props => {
    return(
        <div className='payment-input-container'>
            <label className='number-of-payments-label'><span>Payment </span>#{props.index + 1}</label>

            <div className='payment-input'>
                <div>$</div>
                <input type='number' value={isNaN(props.value) ? 0 : props.value} onChange={(e) => props.set(e.target.value)} disabled={!props.editable || props.disabled}/>
            </div>

            <Tooltip text='Convert value from % to $' placement='left'><button className='btn btn-info' onClick={() => props.calculate()} disabled={props.disabled}>% to $</button></Tooltip>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(OfferSender);