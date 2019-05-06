import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

class Pricing extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showTerms: false
        }
    }
    
    render() {
        return (
            <section id='pricing' className='pt-5'>
                <div className='site-section-col'>
                    <h1>Promotions</h1>

                    <div className='mb-3'>
                        <h3>Bring a Friend <sup><small>1</small></sup></h3>
                        <p>For a limited time, for every client you refer who reaches 3 consecutive months of subscription, you will receive a credit to waive the application fee of a job. Terms and conditions apply.</p>
                    </div>

                    <div>
                        <h3>First 100 <sup><small>2</small></sup></h3>
                        <p>Be the first 100 subscriber to reach 3 consecutive months of subscription and you will receive a credit to waive the application fee of a job. Terms and conditions apply.</p>
                    </div>
                </div>

                <div className='site-section-col'>
                    <h1>Plans</h1>
                    
                    <table className='site-pricing-table'>
                        <thead>
                            <tr>
                                <th>Features</th>
                                <th className='pricing-plan'>
                                    <div>Free</div>
                                    <small>$0 / month</small>
                                </th>
                                <th className='pricing-plan'>
                                    <div>Link Account</div>
                                    <small>$10 / month</small>
                                    <div><small>First month free</small></div>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>User Profile</td>
                                <td colSpan='2'>1 / account</td>
                            </tr>

                            <tr>
                                <td>Post Jobs</td>
                                <td colSpan='2'>Unlimited</td>
                            </tr>

                            <tr>
                                <td>Apply to Jobs</td>
                                <td colSpan='2'>Unlimited</td>
                            </tr>

                            <tr>
                                <td>Messaging</td>
                                <td colSpan='2'>Unlimited</td>
                            </tr>

                            <tr>
                                <td>Event Reminder</td>
                                <td></td>
                                <td>Included</td>
                            </tr>

                            <tr>
                                <td>Link Work</td>
                                <td></td>
                                <td>Available</td>
                            </tr>

                            <tr>
                                <td className='sub-feature'>Job Tracker</td>
                                <td></td>
                                <td>Included</td>
                            </tr>

                            <tr>
                                <td className='sub-feature'>Milestone Tracker</td>
                                <td></td>
                                <td>Included</td>
                            </tr>

                            <tr>
                                <td className='sub-feature'>File Transfers</td>
                                <td></td>
                                <td>Unlimited</td>
                            </tr>

                            <tr>
                                <td className='sub-feature'>Handling of Funds</td>
                                <td></td>
                                <td>Included *</td>
                            </tr>      
                        </tbody>
                    </table>
                </div>

                <div className='site-section-col'>
                    <h1>Link Work Fees <sup><small>*</small></sup></h1>

                    <table className='app-fee-table'>
                        <thead>
                            <tr>
                                <th colSpan='4'>Clients</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td><strong>Fee</strong></td>
                                <td colSpan='3'>3% of milestone deposit (non-refundable)</td>
                            </tr>
                        </tbody>

                        <thead>
                            <tr>
                                <th colSpan='4'>Service Providers</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td colSpan='4' className='text-center'>Calculated by successful payout amount per client. See <NavLink to='/faq'>FAQ</NavLink> for more details.</td>
                            </tr>

                            <tr>
                                <td><strong>Tiers</strong></td>
                                <td>First $500</td>
                                <td>$500.01 - $10,000</td>
                                <td>$10,000.01 +</td>
                            </tr>

                            <tr>
                                <td><strong>Fees</strong></td>
                                <td>15%</td>
                                <td>7.5%</td>
                                <td>3.75%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className='site-section-col'>
                    <small className='text-dark'>
                        <ol>
                            <li className='mb-2'>For every unique referral who subscribes to three (3) consecutive months (including the first free month), the referer's account will receive one (1) credit to waive the the application fee at the account owner's discretion. If within the three (3) consecutive months, the referred account receives a suspension, both accounts will not be eligible for the promotion. If within the three (3) consecutive months, the referred account has any high level of suspicious activity that are not resolved, the referred account will not be eligible for the additional free month of subscription.</li>

                            <li>Accounts that have previous suspension(s), receive a suspension during the three (3) consecutive months, and/or have high level of suspicious activities that are not resolved before the qualifying day of the promotion, the account will not be eligible for the "First 100" promotion. Cancelling the subscription will remove the account from the "First 100" list. Upon qualifying for the promotion, your account will receive a credit to waive the application fee at your discretion. Referred account are not eligible for the "First 100" promotion.</li>
                        </ol>

                        <p>All credits will expire 90 day after it is credited and will be removed from your account. You will receive notice prior to the expiration of the credit. Credits are revocable, non-renewable, non-refundable, and non-transferable and cannot be applied to the client 3% application fee. When redeeming credits, the account must not have received any suspension and/or must not have any high level of suspicious activity that are not resolved. Hire World reserve the rights to revoke or reject any credit at any time with or without notice.</p>

                        <p>For more information on suspicious activities and promotions, please refer to the <NavLink to='/faq'>FAQ</NavLink>.</p>
                    </small>
                </div>
            </section>
        );
    }
}

Pricing.propTypes = {
    user: PropTypes.object,
    sectors: PropTypes.array
};

export default Pricing;