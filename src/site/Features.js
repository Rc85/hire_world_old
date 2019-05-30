import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Badge from '../components/utils/Badge';

class Features extends Component {
    render() {
        return (
            <section id='site-features' className='pt-5'>
                <div className='site-section'>
                    <div className='site-text'>
                        <h1>Link Work</h1>

                        <p>Link Work is a service that allows you to work with other users in different countries of the world. Link Work provide features such as messaging, file transfers, and job progress tracking. On top of that, we handle the funds from your client to you whenever you deliver.</p>

                        <p>Service providers is required to have a Link Account to be able use the service. Each account goes through a verification and review process to ensure that the service provider is conducting business within terms and is a legitimate business.</p>
                    </div>

                    <div className='site-section-image'><img src='/images/connect.jpg' /></div>
                </div>

                <div className='site-section'>
                    <div className='site-section-image'><img src='/images/milestones.jpg' /></div>

                    <div className='site-text'>
                        <h1>Milestones</h1>

                        <p>Jobs are comprised of milestones set by service providers and agreed to by clients. Each milestone consists of one or more conditions. Whenever the service provider completes a condition, the condition can be checked off and will be viewable by the client. The service provider can upload files in each milestone and only the client is authorized to download the file through secured authentication. Once all the conditions in a milestone are marked as complete, the service provider can request payment of amount up to the set in the milestone.</p>
                    </div>
                </div>

                <div className='site-section'>
                    <div className='site-text'>
                        <h1>Funds are Secured</h1>

                        <p>When a job begins, the client deposit funds equal to the price set out in the first milestone. The funds are held securely until the service provider completes the milestone, requests for payment and then the client releases the funds.</p>

                        <p>Funds for milestones thereafter are not deposited until the client starts the milestone.</p>
                    </div>

                    <div className='site-section-image'><img src='/images/funds_secured.jpg' /></div>
                </div>

                <div className='site-section-col text-black'>
                    <h1 className='mb-3'>How It Works</h1>

                    <div className='site-features-section'>
                        <div className='site-features-image'><img src='/images/handshake.jpg' /></div>
                        <div className='site-features-text'>1. The service provider and the client begins a job based on agreed terms, price, and milestones.</div>
                    </div>

                    <div className='site-features-section'>
                        <div className='site-features-image'><img src='/images/tablet.jpg' /></div>
                        <div className='site-features-text'>2. The service provider completes the conditions in milestone and checks them off to update the client.</div>
                    </div>

                    <div className='site-features-section'>
                        <div className='site-features-image'><img src='/images/bill.jpg' /></div>
                        <div className='site-features-text'>3 . The service provider uploads any deliverable and requests payment up to the amount set in the milestone.</div>
                    </div>

                    <div className='site-features-section'>
                        <div className='site-features-image'><img src='/images/pay.png' /></div>
                        <div className='site-features-text'>4. The client reviews the deliverable and if it satisfies the agreement, the client releases the funds to the service provider with one click of a button.</div>
                    </div>

                    <div className='site-features-section'>
                        <div className='site-features-image'><img src='/images/complete.jpg' /></div>
                        <div className='site-features-text'>5. The milestone is complete and the next milestone can be started. If there isn't one, the job is complete.</div>
                    </div>

                    <div className='site-features-section'>
                        <div className='site-features-image'><img src='/images/review.jpg' /></div>
                        <div className='site-features-text'>6. The client can leave a review that holds a <Badge text='Job Complete Verified' count={5} className='badge-primary' counterClassName='text-black' /> badge. Notice the +5 means that the service provider has completed 5 jobs with the same client.</div>
                    </div>
                </div>
            </section>
        );
    }
}

Features.propTypes = {
    user: PropTypes.object,
    sectors: PropTypes.array
};

export default Features;