import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Pricing extends Component {
    render() {
        return (
            <section id='pricing' className='pt-5'>
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
                    <h1>Link Work Fees *</h1>

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
            </section>
        );
    }
}

Pricing.propTypes = {
    user: PropTypes.object,
    sectors: PropTypes.array
};

export default Pricing;