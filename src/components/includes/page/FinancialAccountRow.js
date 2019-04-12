import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUniversity, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faCcVisa, faCcMastercard } from '@fortawesome/free-brands-svg-icons';
import { ShowConfirmation, ResetConfirmation } from '../../../actions/ConfirmationActions';
import { connect } from 'react-redux';

class FinancialAccountRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            edit: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.confirm.data && nextProps.confirm.option) {
            if (nextProps.confirm.data.action === 'delete payment' && nextProps.confirm.data.id === this.props.account.id) {
                this.props.delete();
                this.props.dispatch(ResetConfirmation());
            }
        }
    }
    
    render() {
        let icon, info;

        if (this.props.account.object === 'card' && this.props.account.brand === 'Visa') {
            icon = <FontAwesomeIcon icon={faCcVisa} size='3x' />;
        } else if (this.props.account.object === 'card' && this.props.account.brand === 'MasterCard') {
            icon = <FontAwesomeIcon icon={faCcMastercard} size='3x' />;
        } else if (this.props.account.object === 'bank_account') {
            icon = <FontAwesomeIcon icon={faUniversity} size='3x' />;
        }

        if (this.props.account.object === 'card') {
            info = <div className='ml-2'>
                <div className='mb-1'>
                    <strong>{this.props.account.brand} {this.props.account.funding.charAt(0).toUpperCase() + this.props.account.funding.substr(1)}</strong>
                    <span className='mini-badge mini-badge-info ml-2'>{this.props.account.currency.toUpperCase()}</span>
                    {this.props.account.default_for_currency ? <span className='mini-badge mini-badge-success ml-2'>Default</span> : ''}
                </div>
                <div className='mb-1'>**** **** **** {this.props.account.last4}</div>
                <div className='mb-1'><strong>Expiry Date:</strong> {this.props.account.exp_month}/{this.props.account.exp_year}</div>
                <div className='mb-1'><strong>Available Payout Methods:</strong> {this.props.account.available_payout_methods.map((payout, i) => {
                    return <span key={i} className='mini-badge mini-badge-lightblue mr-1'>{payout}</span>;
                })}</div>
            </div>;
        } else if (this.props.account.object === 'bank_account') {
            info = <div className='ml-2'>
                <div className='mb-1'>
                    <strong>{this.props.account.bank_name}</strong>
                    <span className='mini-badge mini-badge-info ml-2'>{this.props.account.currency.toUpperCase()}</span>
                    {this.props.account.default_for_currency ? <span className='mini-badge mini-badge-success ml-2'>Default</span> : ''}
                </div>
                <div className='mb-1'>***** {this.props.account.last4}</div>
                <div className='mb-1'><strong>Routing Number:</strong> {this.props.account.routing_number}</div>
            </div>;
        }
        
        return (
            <div className='financial-info-container mb-3'>
                <div className='financial-info'>
                    {icon}
                    {info}
                </div>

                <div className='financial-info-buttons'>
                    {!this.props.account.default_for_currency ? <button type='button' className='btn btn-primary' onClick={() => this.props.setDefault()} disabled={this.state.status === 'Setting Default'}>Set as Default</button> : ''}

                    <button type='button' className='btn btn-secondary' onClick={() => this.props.dispatch(ShowConfirmation('Are you sure you want to delete this payment account?', false, {action: 'delete payment', id: this.props.account.id}))}><FontAwesomeIcon icon={faTrash} /></button>
                </div>
            </div>
        );
    }
}

FinancialAccountRow.propTypes = {
    account: PropTypes.object,
    setDefault: PropTypes.func,
    delete: PropTypes.func
};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(FinancialAccountRow);