import React from 'react';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/pro-solid-svg-icons';
import { NavLink } from 'react-router-dom';

const Faq = props => {
    return(
        <section id='faq' className='main-panel'>
            <TitledContainer title='FAQ' shadow icon={<FontAwesomeIcon icon={faQuestionCircle} />} bgColor='danger'>
                <div className='mb-3'>In this frequently asked questions, "service provider" and "Link Work user" refers to a user providing a service and "client" refers to the user paying/hiring the service provider.</div>

                <div id='questions' className='mb-5'>
                    <div className='mb-1'>
                        <a href='#one'>How do I identify a reputable user?</a>
                    </div>
    
                    <div className='mb-1'>
                        <a href='#two'>Is it possible to create more than one listing?</a>
                    </div>
                    
                    <div className='mb-1'>
                        <a href='#three'>How do reports work?</a>
                    </div>
                    
                    <div className='mb-1'>
                        <a href='#four'>How can I become a moderator/administrator for Hire World?</a>
                    </div>
                    
                    <div className='mb-1'>
                        <a href='#five'>I received a warning, what does it mean and how does that affect me?</a>
                    </div>
                    
                    <div className='mb-1'>
                        <a href='#six'>Can I advertise other things on Hire World other than my listing?</a>
                    </div>
                    
                    <div className='mb-1'>
                        <a href='#seven'>I was banned, what does it mean? What did I do? And is there a way to become unbanned?</a>
                    </div>
                    
                    <div className='mb-1'>
                        <a href='#eight'>Why can't I submit more than one review?</a>
                    </div>
                    
                    <div className='mb-1'>
                        <a href='#nine'>How do I hide my contact info and location?</a>
                    </div>
                    
                    <div className='mb-1'>
                        <a href='#ten'>How do I delete my account?</a>
                    </div>

                    <div className='mb-1'>
                        <a href='#eleven'>What is Link Work and how does it work?</a>
                    </div>

                    <div className='mb-1'>
                        <a href='#thirteen'>What happens if the Link Work user does not complete a milestone within 90 days after the funds are deposited?</a>
                    </div>

                    <div className='mb-1'>
                        <a href='#fourteen'>What is a Job Complete Verified review?</a>
                    </div>

                    <div className='mb-1'>
                        <a href='#fifteen'>What if the deliverable does not satisfy the agreed milestone and/or conditions?</a>
                    </div>

                    <div className='mb-1'>
                        <a href='#sixteen'>Why is it important to divide a job into small milestones? What if the job cannot be divided into many milestones?</a>
                    </div>

                    <div className='mb-1'>
                        <a href='#seventeen'>What if the other party doesn't respond after accepting my deliverable?</a>
                    </div>

                    <div className='mb-1'>
                        <a href='#eighteen'>Why should I reject an applicant?</a>
                    </div>
                </div>

                <div className='text-center'>If you have any other questions, please submit them to <a href='mailto:admin@hireworld.ca' rel='noopener noreferrer' target='_blank'>admin@hireworld.ca</a></div>

                <hr/>

                <div id='question'>
                    <div id='one' className='mb-3'>
                        <div className='mb-3'>
                            <strong>How do I identify a reputable user?</strong>
                        </div>

                        <div className='answer'>
                            Reputable service providers can be identified by a combination of the following:
    
                            <ul>
                                <li>
                                    <strong>Completed Jobs</strong> - The number of jobs they successfully completed.
                                </li>
        
                                <li>
                                    <strong>Rating</strong> - The 5 star rating given by their client(s).
                                </li>
        
                                <li>
                                    <strong>Reviews</strong> - Reviews from their client(s) are the most significant factor to identity if a service provider is reputable.
                                </li>
                            </ul>
    
                            Be aware that low numbers should be taken into consideration as service providers can create alternate accounts to give them the needed factors mentioned above. We monitor suspicious activity daily to try to prevent these actions.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='two' className='mb-3'>
                        <div className='mb-3'>
                            <strong>Is it possible to create more than one listing?</strong>
                        </div>

                        <div className='answer'>
                            Currently, a profile can only be listed once under one sector.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='three' className='mb-3'>
                        <div className='mb-3'>
                            <strong>How do reports work?</strong>
                        </div>

                        <div className='answer'>
                            Reports can be made against two things; Service providers' profiles and reviews (more may be added in the future). When you click the report button and specify a reason, a report is sent to the administration panel for investigation. Only one report can be made by a user for each of the two mentioned until an administrator has reviewed and filed your report.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='four' className='mb-3'>
                        <div className='mb-3'>
                            <strong>How can I become a moderator/administrator for Hire World?</strong>
                        </div>

                        <div className='answer'>
                            If you would like to volunteer as a moderator at Hire World, you can contact us and our support will be happy to assist you through the process. Moderator holds the privilege to send warnings to users in advance regarding their actions before it is reported by other users. In the future, Hire World may offer paid job opportunities for administrators. Administrators have access to the admin area where they can control a wide variety of things on Hire World.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='five' className='mb-3'>
                        <div className='mb-3'>
                            <strong>I received a warning, what does it mean and how does that affect me?</strong>
                        </div>

                        <div className='answer'>
                            A warning to you is not publicly displayed, so it does not impact your reputation. A warning is simply just a warning to you. However, if you receive many warnings for the same reason, it may result in a temporary ban and being temporary banned repeatedly can result in a permanent ban. If you have email notifications turned on, you will receive an email regarding the warning.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='six' className='mb-3'>
                        <div className='mb-3'>
                            <strong>Can I advertise other things on Hire World other than my listing?</strong>
                        </div>

                        <div className='answer'>
                            Hire World does not have an ad campaign but may implement one in the future. Currently, you can only advertise whatever you include in your listing details.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='seven' className='mb-3'>
                        <div className='mb-3'>
                            <strong>I was banned, what does it mean? What did I do? And is there a way to become unbanned?</strong>
                        </div>

                        <div className='answer'>
                            <div className='mb-2'>There are two types of ban</div>

                            <div className='mb-2'>
                                <strong>Temporary Ban</strong> - Temporary ban are given with a reason. You may receive temporary bans for, and not limited to the following:
    
                                <ul>
                                    <li>You received many warnings for the same reason</li>
                                    <li>You were given a warning where you need to remove words/content that you submitted, but didn't do so in the given time</li>
                                    <li>Suspicious account activity</li>
                                    <li>Spams</li>
                                </ul>
                            </div>

                            <div className='mb-2'>
                                <strong>Permanent Ban </strong> - Permanent bans are given without a reason. You may receive a permanent ban for, and not limited to the following:

                                <ul>
                                    <li>Fraud activities</li>
                                    <li>You violated the Terms of Service that have zero-tolerance for. See the <NavLink to='/tos'>Terms of Service</NavLink> for more information</li>
                                    <li>You have received multiple temporary bans already</li>
                                </ul>
                            </div>
                        
                            Bans cannot be appealed. If you are temporary banned, you cannot use any of Hire World's features that requires login. If you have an active listing, it will be deactivated and your messages will not be retrieved.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='eight' className='mb-3'>
                        <div className='mb-3'>
                            <strong>Why can't I submit more than one review?</strong>
                        </div>

                        <div className='answer'>
                            We restrict one review per user so that a service provider does not get spammed with multiple ratings. Rating plays an important factor to a service provider's reputation and we don't want anyone manipulating it. If you feel the service provider deserves more or less rating than you initially rated, you can always edit your review.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='nine' className='mb-3'>
                        <div className='mb-3'>
                            <strong>How do I hide my contact info and location?</strong>
                        </div>

                        <div className='answer'>
                            Setting them to blank and disabling them in your settings will hide them.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='ten' className='mb-3'>
                        <div className='mb-3'>
                            <strong>How do I delete my account?</strong>
                        </div>

                        <div className='answer'>
                            We do not delete accounts entirely because often, accounts are tied to reviews are important for a service provider's reputation as well as to others who would like to work with the service provider in the future. However, you have full control of the personal information on your account to be displayed and stored. Please see our <NavLink to='/privacy'>Privacy Policy</NavLink> regarding how data are handled at Hire World.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>
                    
                    <hr/>
                    
                    <div id='eleven' className='mb-3'>
                        <div className='mb-3'>
                            <strong>What is Link Work and how does it work?</strong>
                        </div>

                        <div className='answer'>
                            <p>Link Work is a service powered by <a href='https://stripe.com/connect' rel='noopener noreferrer' target='_blank'>Stripe Connect</a> that ensures a service provider is paid when completing a job. The service is available to service providers working with clients who are cities or countries apart or service providers doing business with clients in-person but want to use Hire World to secure the payment.</p>

                            <p>Users on Hire World will need to be subscribed to the Link Work plan. Once subscribed, users will need to create a Link Work account that will be verified by Stripe and approved by Hire World. Clients can then start a job by submitting a job proposal with the work title and description to the Link Work user for review. The Link Work user creates milestones, preferrably small milestones that can be completed within 90 days, and sends it back to the client. If the client agrees, the job will move to the active stage. During the active stage, whenever the Link Work user completes a condition in the milestone, the condition should be checked off. This allows both parties to see the progress of the job. Only when all the conditions are completed, the Link Work user can send a payment request to the client. If the client is satisfied, the client can release the agreed funds to the Link Work user.</p>

                            <p>Once all milestones are completed, the job will be completed and the client will have the chance to submit a Job Complete Verified review.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>
                    
                    <hr/>
                    
                    <div id='thirteen' className='mb-3'>
                        <div className='mb-3'>
                            <strong>What happens if the Link Work user does not complete a milestone within 90 days after the funds are deposited?</strong>
                        </div>

                        <div className='answer'>
                            <p>We will send a reminder by email to the Link Work user 15 days prior to the 90 days is up regarding the funds status. If the Link Work user does not complete the milestone or if the milestone is not paid within the 90, the funds will be refunded back to the client.</p>
                            <p>If partial work is completed, we encourage clients to discuss with the Link Work user and see if the two can agree upon a partial payment. If an agreement cannot be established, the job will be abandoned once the funds are refunded back to the client.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>
                    
                    <hr/>
                    
                    <div id='fourteen' className='mb-3'>
                        <div className='mb-3'>
                            <strong>What is a Job Complete Verified review?</strong>
                        </div>

                        <div className='answer'>
                            <p>A Job Complete Verified review holds a badge indicating that the review was submitted after a job has been completed. If one does not exist already for a service provider, the client can submit a new rating and review. Each completed job holds a Job Complete Verified review. Submitting any subsequent review after the first one will overwrite the old one and add a +1 counter next to the badge to show that the client has complete that many jobs with the service provider.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>
                    
                    <hr/>
                    
                    <div id='fifteen' className='mb-3'>
                        <div className='mb-3'>
                            <strong>What if the deliverable does not satisfy the agreed milestone and/or conditions?</strong>
                        </div>

                        <div className='answer'>
                            <p>We encourage clients to communicate with the Link Work user and try to come to an agreement for a partial payment.</p>
                            <p>If the Link Work user does not agree to send a request for partial payment, clients have the option to file a case for Hire World to step in and investigate the issue.</p>
                            <p>Keep in mind that filing a dispute doesn't not necessarily mean that it will favor the user that files it.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='sixteen' className='mb-3'>
                        <div className='mb-3'>
                            <strong>Why is it important to divide a job into small milestones? What if the job cannot be divided into many milestones?</strong>
                        </div>

                        <div className='answer'>
                            <p>Whether it's for the client or the Link Work user, small milestones benefit both parties in events where scams are involved to reduce financial or work loss. We limit the milestone payment to $500 to protect both parties financial loss.</p>

                            <p>As a Link Work user, deliverable for a milestone should only equal up to the amount of the milestone, nothing more, nothing less. If the job cannot be divided into multiple small milestones, then the total of all milestone payments can only equal the total job price. For example, if the total job price is $2000, and you can only create two milestones for the job, we advise communicating with the client to agree on down payments or other strategies to satisfy the job. However, we are certain that if a job is priced $2000, it can be divided into at least 4 milestones.</p>

                            <p>As a client, be aware when a Link Work user is asking for down payments due to not being able to create more milestones. Clients can always suggest to the Link Work user on creating milestones that the Link Work user did not thought of. If clients agree to put a down payment to get the job down, down payments should not exceed 50% of the total job price.</p>

                            <p>In the end, the strategy is yours to protect your losses.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>
                    
                    <hr/>
                    
                    <div id='seventeen' className='mb-3'>
                        <div className='mb-3'>
                            <strong>What if the other party doesn't respond after accepting my deliverable?</strong>
                        </div>

                        <div className='answer'>
                            <p>You can file a case and we will investigate the issue. Keep in mind that it can as long as up to 5 days prior to the day the funds are refunded back to the client to reach a decision.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>
                </div>
            </TitledContainer>
        </section>
    )
}

export default Faq;