import React from 'react';
import TitledContainer from '../components/utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/pro-solid-svg-icons';
import { NavLink } from 'react-router-dom';

const Faq = props => {
    return(
        <section id='faq' className='main-panel'>
            <TitledContainer title='FAQ' shadow icon={<FontAwesomeIcon icon={faQuestionCircle} />} bgColor='danger' shadow>
                <div id='questions' className='mb-5'>
                    <div className='mb-3'>
                        <h1>General</h1>
    
                        <div className='mb-1'>
                            <a href='#three'>How do reports work?</a>
                        </div>
                        
                        <div className='mb-1'>
                            <a href='#four'>How can I become a moderator/administrator for Hire World?</a>
                        </div>
                        
                        <div className='mb-1'>
                            <a href='#six'>Can I advertise other things on Hire World other than my listing?</a>
                        </div>
                        
                        <div className='mb-1'>
                            <a href='#eight'>Why can't I submit more than one review?</a>
                        </div>
                        
                        <div className='mb-1'>
                            <a href='#twentythree'>What is "suspicious activity"?</a>
                        </div>
                        
                        <div className='mb-1'>
                            <a href='#twentyfour'>After reaching the qualified date of a promotion, I realized that high level of suspicious activity were found on my account, will I still be eligible for the promotion?</a>
                        </div>
                    </div>

                    <div className='mb-3'>
                        <h1>Account</h1>
                        
                        <div className='mb-1'>
                            <a href='#five'>I received a warning, what does it mean and how does that affect me?</a>
                        </div>
                        
                        <div className='mb-1'>
                            <a href='#seven'>I was banned, what does it mean? What did I do? And is there a way to become unbanned?</a>
                        </div>
                        
                        <div className='mb-1'>
                            <a href='#nine'>How do I hide my contact info and location?</a>
                        </div>
                        
                        <div className='mb-1'>
                            <a href='#ten'>How do I delete my account?</a>
                        </div>
                    </div>
                    
                    <div className='mb-3'>
                        <h1>Jobs</h1>
    
                        <div className='mb-1'>
                            <a href='#one'>How do I identify a reputable user?</a>
                        </div>
    
                        <div className='mb-1'>
                            <a href='#fourteen'>What is a Job Complete Verified review?</a>
                        </div>
    
                        <div className='mb-1'>
                            <a href='#nineteen'>Unlimited job posting, is that a joke?</a>
                        </div>

                        <div className='mb-1'>
                            <a href='#twentyone'>What is the difference between posting a job and finding my candidate through profiles?</a>
                        </div>
                    </div>

                    <div className='mb-3'>
                        <h1>Link Work</h1>
    
                        <div className='mb-1'>
                            <a href='#eleven'>What is Link Work and how does it work?</a>
                        </div>
    
                        <div className='mb-1'>
                            <a href='#eigh'>Can any business use Link Work?</a>
                        </div>
    
                        <div className='mb-1'>
                            <a href='#thirteen'>What happens if the service provider does not complete a milestone within 90 days after the funds are deposited?</a>
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
                            <a href='#twenty'>I started a job with a service provider, deposited funds, but changed my mind, what are my options?</a>
                        </div>

                        <div className='mb-1'>
                            <a href='#twentytwo'>If I want to stop using Link Work, should I cancel my subscription or close my Link Work account?</a>
                        </div>

                        <div className='mb-1'>
                            <a href='#twentyfive'>Does Hire World support hourly billing?</a>
                        </div>

                        <div className='mb-1'>
                            <a href='#twentysix'>How is the service provider application fee calculated?</a>
                        </div>

                        <div className='mb-1'>
                            <a href='#twentyseven'>What happens if a payout fails?</a>
                        </div>

                        <div className='mb-1'>
                            <a href='#twentyeight'>Am I obligated to use Hire World as my primary source of contact wth my clients?</a>
                        </div>
                    </div>
                </div>

                <div className='text-center'>If you have any other questions, please submit them to <a href='mailto:admin@hireworld.ca' rel='noopener noreferrer' target='_blank'>admin@hireworld.ca</a></div>

                <hr/>

                <div id='question'>
                    <div id='one' className='mb-3'>
                        <div className='mb-3'>
                            <strong>How do I identify a reputable service provider?</strong>
                        </div>

                        <div className='answer'>
                            Reputable service providers can be identified by a combination of the following:
    
                            <ul>
                                <li>
                                    <strong>Completed Jobs</strong> - The number of jobs they successfully completed.
                                </li>
        
                                <li>
                                    <strong>Rating</strong> - The 5 star rating on their profile.
                                </li>
        
                                <li>
                                    <strong>Reviews</strong> - Reviews with a <strong>Job Complete Verified</strong> badge are the most significant factor to identity if a service provider is reputable.
                                </li>
                            </ul>
    
                            Be aware that low numbers should be taken into consideration as service providers can create alternate accounts to give them the needed factors mentioned above. We monitor suspicious activity daily to try to prevent these actions.
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
                            When you click the report button and specify a reason, a report is sent to the administration panel for investigation. Only one report can be made by a user for each reportable content until an administrator has reviewed and filed your report.
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
                            If you would like to volunteer as a moderator at Hire World, you can contact us and our support will be happy to assist you through the process. Moderator holds the privilege to send warnings to users in advance regarding their actions before it is reported by other users. In the future, Hire World may offer paid job opportunities for administrators. Administrators have access to the admin area where they can control a wide variety of configurations on Hire World.
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
                            A warning to you is not publicly displayed, so it does not impact your reputation. A warning is simply just to warn you that your action may result in further action such as being banned. If you receive many warnings for the same reason, it may result in a temporary ban and being temporary banned repeatedly can result in a permanent ban. If you have email notifications turned on, you will receive an email regarding the warning.
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
                            Hire World does not have an ad campaign but may implement one in the future. Currently, you can only advertise your service or product that you include in your proile details.
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
                                    <li>Fraudulent activities</li>
                                    <li>You violated the Terms of Service that have zero-tolerance for. See the <NavLink to='/tos'>Terms of Service</NavLink> for more information</li>
                                    <li>You have received multiple temporary bans already</li>
                                </ul>
                            </div>
                        
                            <p>Bans cannot be appealed. If you are temporary banned, your profile and all your posted jobs will brought offline and you will be removed from any jobs that you applied for. When your ban is over, you will reappear on the jobs that you applied for. However, your posted jobs and profile will need to be manually re-enabled.</p>
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
                            <p>We restrict one review per user so that a service provider does not get spammed with multiple ratings. Rating plays an important factor to a service provider's reputation and we don't want anyone manipulating it. If you feel the service provider deserves more or less rating than you initially rated, you can always edit your review.</p>

                            <p>Users should take notice of the Job Complete Verified counter in the badge. This is an indication that the service provider have received multiple of these reviews and is a strong indicator that the service provider is reputable.</p>
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
                            <p>Setting them to blank and disabling them in your settings will hide them.</p>
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
                            We do not delete accounts entirely because often, accounts are tied to reviews that are important to a service provider's reputation as well as to others who would like to work with the service provider in the future. However, you have full control of the personal information on your account to be displayed and stored. Please see our <NavLink to='/privacy'>Privacy Policy</NavLink> regarding how data are handled at Hire World.
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
                            <p>Link Work is a service powered by <a href='https://stripe.com/connect' rel='noopener noreferrer' target='_blank'>Stripe Connect</a> that ensures a service provider is paid when completing a job. The service is available to any business that needs a trusted platform to secure funds from their clients before any work begins.</p>

                            <p>All users who wants to use the Link Work service will need to be subscribed to the Link Work plan. Only the service provider is required to have a Link Work account in order for clients to start a job with the service provider. Clients can start a job by submitting a job proposal with the work title and description to the service provider to review. The service provider will then create milestones, preferrably small milestones that can be completed within 90 days, based on the job description. If the client agrees, the job will move to the active stage. During the active stage, whenever the service provider completes a condition in the milestone, the condition must be checked off. This allows both parties to see the progress of the job and only when all the conditions are checked, the service provider can request for payment from the client. If the client is satisfied, the client can release the agreed funds to the service provider.</p>

                            <p>Once all milestones are completed, the job will be completed and the client will have the chance to submit a Job Complete Verified review.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>
                    
                    <hr/>
                    
                    <div id='thirteen' className='mb-3'>
                        <div className='mb-3'>
                            <strong>What happens if the service provider does not complete a milestone within 90 days after the funds are deposited?</strong>
                        </div>

                        <div className='answer'>
                            <p>We will send a reminder by email to the service provider 30 days prior to the 90 days is up regarding the funds status. If the service provider does not complete the milestone or if the milestone is not paid within the 90, the funds will be refunded back to the client 1 day prior to the 90 days.</p>
                            <p>If partial work is completed, we encourage clients to discuss with the service provider and see if the two can agree upon a partial payment. If an agreement cannot be established, the job will be abandoned once the funds are refunded back to the client.</p>
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
                            <p>A Job Complete Verified review holds a badge indicating that the review was submitted after a job has been completed. If one does not exist already for a service provider, the client can submit a new rating and review. Each completed job holds a Job Complete Verified review. Submitting any subsequent review after the first one will overwrite the old one and add a +1 (incrementing as more reviews from the same client are submitted) next to the badge to show that the client has complete that many jobs with the service provider.</p>
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
                            <p>We encourage clients to communicate with the service provider and try to come to an agreement for a reasonable payment for the work done.</p>
                            <p>If the service provider does not agree to send a request for partial payment, clients have the option to file a case for Hire World to step in and investigate the issue.</p>
                            <p>Keep in mind that filing a dispute does not necessarily mean that it will favor the user that files it.</p>
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
                            <p>Whether it's for the client or the service provider, small milestones benefit both parties in events where scams are involved to reduce financial or work loss.</p>

                            <p>As a service provider, deliverable for a milestone should only equal up to the amount of the milestone, nothing more, nothing less.</p>

                            <p>As a client, be aware when a service provider is asking for down payments. Clients can always suggest to the service provider on creating milestones that the service provider did not thought of in place of a down payment. If clients agree to put a down payment to get the job done, down payments should not exceed 50% of the total job price.</p>

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

                    <hr/>
                    
                    <div id='eighteen' className='mb-3'>
                        <div className='mb-3'>
                            <strong>Can any business use Link Work?</strong>
                        </div>

                        <div className='answer'>
                            <p>As long as your business doesn't fall under any business in <a href='https://stripe.com/restricted-businesses' target='_blank' rel='noreferer noopener'>Stripe's restricted business</a> list, you can use Link Work. Link Work doesn't only cater to freelancers, but to anyone who are seeking a "middle man" to secure the funds for a business transaction. There have been cases where clients don't pay their service providers after the job is complete and the service providers have to chase after their clients for the money. With Link Work, service providers will have the peace of mind that their clients have the intention to pay and the money is in the hands of a trusted platform.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>

                    <div id='nineteen' className='mb-3'>
                        <div className='mb-3'>
                            <strong>Unlimited job posting, is that a joke?</strong>
                        </div>

                        <div className='answer'>
                            <p>No, we are serious. You can post as many jobs as you like as long as you're not spamming the same job throughout the sectors and that it falls under the correct sector (although our mods may move it if they feel it is not in the correct sector). Be warned that if you abuse the unlimited posting privilege to spam your job to get noticed, we may suspend your account.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>

                    <div id='twenty' className='mb-3'>
                        <div className='mb-3'>
                            <strong>I started a job with a service provider, deposited funds, but changed my mind, what are my options?</strong>
                        </div>

                        <div className='answer'>
                            <p>Communication is the key. Discuss with the other party on closing the job and you will get your money back. However, do note that the 3% application fee will not be refunded.</p>

                            <p>As for the service provider, if clients change their mind and want their money back, we strongly encourage service providers to comply as they do not incur any loss. If they do not comply and forces the service provider to continue on with the job, it opens up many doors of risks that the service provider do not want to take, such as client not responding and will eventually get their money back after 90 days.</p>

                            <p>On the other hand, if the client opens up a case because of such disagreement, chances are Hire World will close the job for them as the decision favors both sides.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>

                    <div id='twentyone' className='mb-3'>
                        <div className='mb-3'>
                            <strong>What is the difference between posting a job and finding my candidate through profiles?</strong>
                        </div>

                        <div className='answer'>
                            <p>Posting a job opens up positions for candidates that are not only in your area, but for different countries. This is good if you are hiring remotely or through Link Work and that the position is not required to be filled immediately.</p>

                            <p>Searching for your candidate through the profile directory is good when you need a job completed immediately. You don't want to wait for applicants to come in and instead contact a service provider directly.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>

                    <div id='twentytwo' className='mb-3'>
                        <div className='mb-3'>
                            <strong>If I want to stop using Link Work, should I cancel my subscription or close my Link Work account?</strong>
                        </div>

                        <div className='answer'>
                            <p>We suggest that you cancel your subscription and leave your Link Work account intact. If for any reason you want to close your Link Work account, you may do so once there are no remaining balance on your account.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>

                    <div id='twentythree' className='mb-3'>
                        <div className='mb-3'>
                            <strong>What is "suspicious activity"?</strong>
                        </div>

                        <div className='answer'>
                            <p>Suspicious activities can involve many things from using a stolen credit card, entering address during payments that do not match the card, and using a different name than your Hire World's account name to sign up for Link Work. We understand that under some circumstances, some activities that are deemed suspicious will happen on Hire World. We measure suspicious activities from level one to five, five being severe. For example, using a different name to create a Link Work account will be considered suspicious activity, but it is not considered "high" level suspicious activity. High level suspicious activity fall under level 4 and 5. However, suspicious activities that have a low level can also be considered high by our administrators. For example, repeated failures of CVC check within a short period of time when entering payment information can be considered as high level of suspicious activity.</p>

                            <p>We have multiple systems in place to monitor all sorts of activities in order to provide the best experience and safe platform for our users. When high level of suspicious activity is detected, we will notify you by email that such detection has occurred on your account. The purpose of an email notification is so that you are given the opportunity to reply to the email claiming that the activity was performed by you so that we can flag it as "resolved". Not all suspicious activities will be notified by email and can be flagged as "resolved". Take for example, the CVC check scenario mentioned above.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>

                    <div id='twentyfour' className='mb-3'>
                        <div className='mb-3'>
                            <strong>After reaching the qualified date of a promotion, I realized that high level of suspicious activity were found on my account, will I still be eligible for the promotion?</strong>
                        </div>

                        <div className='answer'>
                            <p>We understand that sometimes emails and notifications can become buried by other emails and notifications. If under any circumstances that you realized after the notice regarding high level of suspicious activity on your account that may be the cause of your disqualification of a promotion, you can contact us to resolve the suspicious activity on your account in addition to an explanation of the disqualification of a promotion and we will happily restore your eligibility of the promotion.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>

                    <div id='twentyfive' className='mb-3'>
                        <div className='mb-3'>
                            <strong>Does Hire World support hourly billing?</strong>
                        </div>

                        <div className='answer'>
                            <p>At the moment we do not have a time tracking software to support hourly billing. It is a goal we plan to accomplish on the horizon as our user base increases.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>

                    <div id='twentysix' className='mb-3'>
                        <div className='mb-3'>
                            <strong>How is the service provider application fee calculated?</strong>
                        </div>

                        <div className='answer'>
                            <p>The service provider application fee is calculated by the lifetime transaction amount with a client where the milestone in relation to the transaction must be either complete or unpaid.</p>

                            <p>All calculations are based on previous requested amount plus the service provider application fee. The 3% client application fee are not taken into account and the currency of the application fee will be in the currency of the charge.</p>

                            <p>Here is an example scenario considering transactions with the same client:</p>

                            <ul>
                                <li>You completed your first ever milestone priced at $600. Your application fee will be $82.50 (15% of $500 and 7.5% of the remaining $100).</li>
                                <li>You completed another milestone priced at $300. Your application fee will be $22.50 (7.5%). Your lifetime transaction amount is now at $900.</li>
                                <li>You completed another milestone priced at $9,200. Your application will be $686.25 (7.5% of $9100 and 3.75% of the remaining $100). Your lifetime amount is now $10,100</li>
                                <li>You completed another milestone at $500. Your application fee will be $18.75 (3.75% of $500).</li>
                            </ul>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>

                    <div id='twentyseven' className='mb-3'>
                        <div className='mb-3'>
                            <strong>What happens if a payout fails?</strong>
                        </div>

                        <div className='answer'>
                            <p>The reason for a "failed" payout is often related to the service provider's account to where the payout is sent. Common reasons may include the account does not accept the payout currency, the account does not allow debit transactions, incorrect information such as account number or the account holder's name, and restricted bank account type such as a savings account or non-chequing account. Note that these are not the only reasons.</p>

                            <p>When a payout fails, the milestone will be placed in a "Unpaid" state where the service provider will be allow to request to be paid again without the approval of the client to release the funds. In addition, if the funds have been held for 90 days or more, it will attempt to pay out the funds. Make sure to add a new valid bank account and try again.</p>
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>

                    <div id='twentyeight' className='mb-3'>
                        <div className='mb-3'>
                            <strong>Am I obligated to use Hire World as my primary source of contact wth my clients?</strong>
                        </div>

                        <div className='answer'>
                            <p>No, you can use your personal email, phone number, or any messaging service as you wish. Do note that if you file a case, we will consider any communications and files handled outside of Hire World. We strongly advise you use Hire World as your pirmary source of communication to protect yourself if a case does arise.</p>
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