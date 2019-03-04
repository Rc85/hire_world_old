import React from 'react';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const Faq = props => {
    return(
        <section id='faq' className='main-panel'>
            <TitledContainer title='FAQ' shadow icon={<FontAwesomeIcon icon={faQuestionCircle} />} bgColor='danger'>
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
                        <a href='#four'>How can I become a moderator/administrator for HireWorld?</a>
                    </div>
                    
                    <div className='mb-1'>
                        <a href='#five'>I received a warning, what does it mean and how does that affect me?</a>
                    </div>
                    
                    <div className='mb-1'>
                        <a href='#six'>Can I advertise other things on HireWorld other than my listing?</a>
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
                        <a href='#eleven'>I purchased the 30 Day Listing plan and decided I want to subscribe, how will I be charged?</a>
                    </div>
                </div>

                <div className='text-center'>If you have any other questions, please submit them to <a href='mailto:admin@hireworld.ca'>admin@hireworld.ca</a></div>

                <hr/>

                <div id='question'>
                    <div id='one' className='mb-5'>
                        <div className='mb-3'>
                            <strong>How do I identify a reputable user?</strong>
                        </div>

                        <div className='answer'>
                            Reputable users can be identified by a combination of the following:
    
                            <ul>
                                <li>
                                    <strong>Completed Jobs</strong> - The number of jobs they successfully completed.
                                </li>
        
                                <li>
                                    <strong>Rating</strong> - The 5 star rating given by other users.
                                </li>
        
                                <li>
                                    <strong>Reviews</strong> - Reviews from other users are the most significant factor to identity if a user is reputable.
                                </li>
        
                                <li>
                                    <strong>Medals</strong> - Medals are purchased and honored to the user by other users.
                                </li>
                            </ul>
    
                            Be aware that low numbers should be taken into consideration as users can create alternative accounts to give them the needed factors mentioned above. We monitor suspicious activity daily to try to prevent these actions.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='two' className='mb-5'>
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
                    
                    <div id='three' className='mb-5'>
                        <div className='mb-3'>
                            <strong>How do reports work?</strong>
                        </div>

                        <div className='answer'>
                            Reports can be made against two things; Users and reviews. When you click the report button and specify a reason, a report is sent to the administration panel for investigation. Only one report per user can be made for each of the two mentioned until an administrator files your report.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='four' className='mb-5'>
                        <div className='mb-3'>
                            <strong>How can I become a moderator/administrator for HireWorld?</strong>
                        </div>

                        <div className='answer'>
                            If you would like to volunteer as a moderator at HireWorld, you can contact us and our support team will be happy to assist you through the process. In the future, HireWorld may offer paid job opportunities for administrators.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='five' className='mb-5'>
                        <div className='mb-3'>
                            <strong>I received a warning, what does it mean and how does that affect me?</strong>
                        </div>

                        <div className='answer'>
                            A warning to you is not publicly displayed, so it does not impact your reputation. A warning is simply just a warning to you. However, if you receive many warnings for the same reason, it may result in a temporary ban and being temporary banned repeatedly can result in a permanent ban.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='six' className='mb-5'>
                        <div className='mb-3'>
                            <strong>Can I advertise other things on HireWorld other than my listing?</strong>
                        </div>

                        <div className='answer'>
                            Currently, HireWorld does not have an ad campaign. You can only advertise whatever you include in your listing details.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='seven' className='mb-5'>
                        <div className='mb-3'>
                            <strong>I was banned, what does it mean? What did I do? And is there a way to become unbanned?</strong>
                        </div>

                        <div className='answer'>
                            <div className='mb-2'>There are two types of ban</div>

                            <div className='mb-2'>
                                <strong>Temporary Ban</strong> - Temporary ban are given with a reason. You may receive temporary bans for, and not limited to the following:
    
                                <ul>
                                    <li>You received many warnings for the same reason.</li>
                                    <li>You were given a warning where you need to remove words/content that you submitted, but didn't do so in the given time.</li>
                                    <li>Suspicious account activity.</li>
                                    <li>Spams</li>
                                </ul>
                            </div>

                            <div className='mb-2'>
                                <strong>Permanent Ban </strong> - Permanent bans are given without a reason. You may receive a permanent ban for, and not limited to the following:

                                <ul>
                                    <li>Fraud activities</li>
                                    <li>
                                        You violated the Terms of Service that have zero-tolerance for. See the <a href='/tos'>Terms of Service</a> for more information.
                                    </li>
                                    <li>You have received multiple temporary bans already.</li>
                                </ul>
                            </div>
                        
                            Bans cannot be appealed. If you are temporary banned, you cannot use any of HireWorld's features. If you have an active listing, it will be deactivated and your messages will not be retrieved.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='eight' className='mb-5'>
                        <div className='mb-3'>
                            <strong>Why can't I submit more than one review?</strong>
                        </div>

                        <div className='answer'>
                            We restrict one review per user so that a user does not get spammed with multiple ratings. Rating plays an important factor to a user reputation and we don't want anyone manipulating it. If you feel the user deserves more or less rating than you initial rated, you can always edit your review.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>

                    <hr/>
                    
                    <div id='nine' className='mb-5'>
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
                    
                    <div id='ten' className='mb-5'>
                        <div className='mb-3'>
                            <strong>How do I delete my account?</strong>
                        </div>

                        <div className='answer'>
                            We do not delete accounts entirely because often, accounts are tied to reviews that have impact on a user's reputation. However, you have full control of the personal information on your account to be displayed. Please see our <a href='/privacy'>Privacy Policy</a> regarding how data are handled at HireWorld.
                        </div>

                        <div className='text-right'>
                            <a href='#top'>Top</a>
                        </div>
                    </div>
                    
                    <hr/>
                    
                    <div id='eleven' className='mb-5'>
                        <div className='mb-3'>
                            <strong>I purchased 30 Day Listing and decided I want to subscribe, vice versa. How will I be charged?</strong>
                        </div>

                        <div className='answer'>
                            <p>When your purchase the 30 Days Listing plan and within those 30 days, you subscribe to the recurring plan, you will charged once the 30 days from your 30 Day Listing purchase is depleted.</p>
                            <p>When you are subscribed, logically you will not need to purchase the 30 Days Listing plan and the system won't allow you to.</p>
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