import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

const OfferDetails = props => {
    let offer, offerTerm, completedBy, paymentPeriod, paymentContainer, offerDetail, dateText, editedText, offerButtons;
    let payments = [];

    if (props.offer && props.offer.offer_term) {
        offerTerm = <div className='underline-div'>
            <strong>Offer Term</strong>
            <div>{props.offer.offer_term}</div>
        </div>;
    }

    if (props.offer && props.offer.completed_by) {
        completedBy = <div className='underline-div'>
            <strong>Complete By</strong>
            <div>{moment(props.offer.completed_by).format('MM-DD-YYYY')}</div>
        </div>;
    }

    if (props.offer && props.offer.offer_payment_period) {
        paymentPeriod = <div className='underline-div'>
            <strong>Payment Period</strong>
            <div>{props.offer.offer_payment_period}</div>
        </div>;
    }

    if (props.offer && props.offer.offer_number_of_payments > 0) {
        for (let i = 0; i < props.offer.offer_number_of_payments; i++) {
            let el = <div key={i} className='payments dotted-underline-div'>
                <strong>#{i + 1}:</strong>
                
                <div>${props.offer[`offer_payment_${i + 1}`]}</div>
            </div>

            payments.push(el);
        }

        paymentContainer = <div className='underline-div'>
            <strong>Payments</strong>
            
            <div className='payments-container'>{payments}</div>
        </div>;
    }

    if (props.show) {
        offerDetail = <div id='offer-detail-container' className='bordered-container'>
            <div className='underline-div'>
                <strong>Offer Type</strong>
                <div>{props.offer.offer_type}</div>
            </div>

            <div className='underline-div'>
                <strong>Offer Price</strong>
                <div>${props.offer.offer_price} {props.offer.offer_currency} / {props.offer.offer_payment_type}</div>
            </div>

            {offerTerm}

            {completedBy}

            {paymentPeriod}

            {paymentContainer}
        </div>
    }

    if (props.stage === 'Inquire') {
        if (props.offer.offer_modified_date) {
            editedText = <span>(Modified {moment(props.offer.offer_modified_date).fromNow()})</span>;
        }

        dateText = <div className='offer-date-text'><small>Received {moment(props.offer.offer_created_date).fromNow()} {editedText}</small></div>;
    } else {
        dateText = <div className='offer-date-text'><button className='btn btn-info btn-sm' onClick={() => props.toggleOfferDetail()}>{props.show ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}</button></div>;
    }

    if (props.stage === 'Inquire') {
        offerButtons = <React.Fragment>
            <div className='mb-1'>
                <button className='btn btn-success' onClick={() => props.accept()}>Accept</button> <button className='btn btn-danger' onClick={() => props.decline()}>Decline</button>
            </div>

            <div><small className='text-right text-muted'>Offer ID: {props.offer.offer_id}</small></div>
        </React.Fragment>;
    }

    if (props.offer && props.offer.offer_confidentiality) {
        offer = <div className='offer-message'>
            <div className='offer-confidential-message'><strong>The other party has chosen to keep the offer detail confidential.</strong></div>
            
            {offerButtons}
        </div>;
    } else if (props.offer && !props.offer.offer_confidentiality) {
        offer = <div>
            {dateText}

            {props.stage === 'Inquire' ? <div className='offer-message'><strong><em>The client has sent you an offer. Review it and make a decision as soon as possible.</em></strong></div> : ''}

            {offerDetail}

            {offerButtons}
        </div>;
    }

    return(
        <div>
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