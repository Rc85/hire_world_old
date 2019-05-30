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

                    <div>
                        <h3>First 100 <sup><small>2</small></sup></h3>
                        <p>Get up to $500 off the application fee of a job when you are the first 100 to register and activate your account and list your profile.</p>
                    </div>
                </div>

                {/* <div className='site-section-col'>
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
                </div> */}

                <div className='site-section-col'>
                    <h1>Link Work Fees</h1>

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
                            <li><strong>First 100:</strong> To qualify for this promotion, profiles must be listed for a period of thirty (30) days. Unlisting your profile whether by you or by our admin will reset the day count back to zero. Accounts that receive a ban will be disqualified from the promotion. Accounts that have one or more suspicious activity that does not resolve by the time the account qualifies for the promotion, will not receive the $500 discount (exemptions apply, see <NavLink to='/faq'>FAQ</NavLink> for more details). The $500 discount is only applicable to the service provider's application fee and not the client's 3% application fee. Upon qualifying for the promotion, the qualified account will receive a revocable, non-transferrable, non-refundable, one-time-use $500 discount on the application fee of the next job with a client. If the application fee does not equal or exceed the $500 discount, the unused amount cannot be redeemed, claimed, or saved for future use as it is a one-time-use discount. Discount will remain on the account until it is used or if the account receives a ban, the discount will be revoked.</li>
                        </ol>

                        <p>The above stated terms and conditions are conjunction with our <NavLink to='/tos/'>Terms of Service</NavLink>. For more information on suspicious activity and promotions, please refer to our <NavLink to='/faq'>FAQ</NavLink>.</p>
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