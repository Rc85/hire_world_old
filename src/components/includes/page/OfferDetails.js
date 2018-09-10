import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

const OfferDetails = props => {
    let offer, offerTerm, completedBy, paymentPeriod, paymentContainer, offerDetail, dateText, editedText;
    let payments = [];

    if (props.offer && props.offer.offer_term) {
        offerTerm = <div className='w-30'>
            <strong>Offer Term:</strong> {props.offer.offer_term}
        </div>
    }

    if (props.offer && props.offer.completed_by) {
        completedBy = <div className='w-30'>
            <strong>Complete By:</strong> {moment(props.offer.completed_by).format('MM-DD-YYYY')}
        </div>
    }

    if (props.offer && props.offer.offer_payment_period) {
        paymentPeriod = <div className='w-30'>
            <strong>Payment Period:</strong> {props.offer.offer_payment_period}
        </div>
    }

    if (props.offer && props.offer.offer_number_of_payments > 0) {
        for (let i = 0; i < props.offer.offer_number_of_payments; i++) {
            let el = <div key={i} className='d-flex w-30 text-center'>
                <div className='w-20'><strong>#{i + 1}:</strong></div> <div className='w-80'>${props.offer[`offer_payment_${i + 1}`]}</div>
            </div>

            payments.push(el);
        }

        paymentContainer = <div>
            <hr/>
            <strong>Payments</strong>
            <div className='d-flex-between-start flex-wrap mb-3'>
                {payments}
            </div>
        </div>
    }

    if (props.show) {
        offerDetail = <div className='bordered-container rounded mb-3'>
            <div className='d-flex-between-start mb-3'>
                <div className='w-30'>
                    <strong>Offer Type:</strong> {props.offer.offer_type}
                </div>

                {offerTerm}

                {completedBy}
            </div>

            <hr/>

            <div className='d-flex-between-start mb-3'>
                <div className='w-30'>
                    <strong>Offer Price:</strong> ${props.offer.offer_price} {props.offer.offer_currency}
                </div>

                <div className='w-30'>
                    <strong>Payment Type:</strong> {props.offer.offer_payment_type}
                </div>

                {paymentPeriod}
            </div>

            {paymentContainer}
        </div>
    }

    if (props.stage === 'Inquire') {
        if (props.offer.offer_modified_date) {
            editedText = <span>(Modified {moment(props.offer.offer_modified_date).fromNow()})</span>;
        }

        dateText = <div className='mb-3'><small className='text-muted'>Received {moment(props.offer.offer_created_date).fromNow()} {editedText}</small></div>;
    } else {
        dateText = <div className='d-flex-between-start mb-3'><strong>Offer Details</strong><button className='btn btn-info btn-sm' onClick={() => props.toggleOfferDetail()}>{props.show ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}</button></div>;
    }

    if (props.offer && props.offer.offer_confidentiality) {
        offer = <div className='mb-3'>The other party choose to keep the offer detail confidential between you two.</div>;
    } else if (props.offer && !props.offer.offer_confidentiality) {
        offer = <div className='grey-panel rounded mb-3' role='alert'>
            {dateText}

            {props.stage === 'Inquire' ? <div className='text-center mb-3'><strong><em>The client has sent you an offer. Review it and make a decision as soon as possible.</em></strong></div> : ''}

            {offerDetail}

            <div className='d-flex-between-end'>
                <div>
                    {props.stage === 'Inquire' ? <button className='btn btn-success' onClick={() => props.accept()}>Accept</button> : '' }
                </div>
                <div><small className='text-muted'>Offer ID: {props.offer.offer_id}</small></div>
            </div>
        </div>;
    }

    return(
        <div className='mb-3'>
            {offer}
        </div>
    )
}

OfferDetails.propTypes = {
    offer: PropTypes.object,
    accept: PropTypes.func,
    stage: PropTypes.string,
    show: PropTypes.bool,
    toggleOfferDetail: PropTypes.func
}

export default OfferDetails;