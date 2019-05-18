import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faUsers, faThumbsUp, faSearchDollar } from '@fortawesome/pro-solid-svg-icons';
import { connect } from 'react-redux';

class Main extends Component {
    render() {
        return (
            <section className='site-main'>
                <div className='site-main-container'>
                    <div className='site-main-banner'>
                        <div className='site-main-headline'>
                            <div className='text-right'>
                                <h1>Start your business</h1>
                                <span>We have the services to assist you on starting and growing your business</span>

                                <div className='text-right mt-2'><NavLink to='/register'><button type='button' className='btn btn-primary'>Get Started</button></NavLink></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='site-section-div-container'>
                    <div className='site-section-div'>
                        <div className='text-center mb-1'><FontAwesomeIcon icon={faSearchDollar} size='3x' className='text-highlight' /></div>
                        <div className='text-center mb-3'><h3>No Hidden Fees</h3></div>

                        <p>No processing fees, administration fees, refund fees, currency exchange fees, partial payment fees, VAT, or "more profit" fees. Our fees are simple and transparent.</p>
                    </div>

                    <div className='site-section-div'>
                        <div className='text-center mb-1'><FontAwesomeIcon icon={faThumbsUp} size='3x' className='text-highlight' /></div>
                        <div className='text-center mb-3'><h3>No Obligations</h3></div>

                        <p>You're not obligated to use Hire World as a form of contact with your clients. On top of that, the network you build on Hire World is yours to keep should you choose to stop using our services.</p>
                    </div>

                    <div className='site-section-div'>
                        <div className='text-center mb-1'><FontAwesomeIcon icon={faShieldAlt} size='3x' className='text-highlight' /></div>
                        <div className='text-center mb-3'><h3>No Worries</h3></div>

                        <p>Your funds are secured with us no matter where you are, so you can focus primarily on your business while we take care of the billing and transfers.</p>
                    </div>
                </div>

                <div className='site-section'>
                    <div className='site-text'>
                        <h1>Freelancers</h1>

                        <p>Whether you're looking for work locally, remotely, or through <NavLink to='/features'>Link Work</NavLink>, we have the services to help with your business from communications, payments, and file transfers.</p>
                    </div>

                    <div className='site-section-image'>
                        <img src='/images/main1.png' />
                    </div>
                </div>

                <div className='site-section'>
                    <div className='site-section-image'>
                        <img src='/images/main2.png' />
                    </div>

                    <div className='site-text'>
                        <h1>Service Providers</h1>

                        <p>If you're a contractor, have a service to offer, or want to start a side business, our platform can help you gain exposure to potential clients. Whether your professional profile is branding yourself, your product or service, your talent and skill, or your business name, we have a directory for you to list your profile absolutely free.</p>
                    </div>
                </div>

                <div className='site-section'>
                    <div className='site-text'>
                        <h1>Recruiters</h1>

                        <p>Recruiters can post jobs looking for specific talents for full-time, part-time, or even just for a project. Applicants can apply on your job posting with one click of a button.</p>
                    </div>

                    <div className='site-section-image'>
                        <img src='/images/main3.jpg' />
                    </div>
                </div>

                <div className='text-center'>
                    <h5 className='mb-3 text-blue'>Register free today!</h5>
                    <NavLink to='/register'><button className='btn btn-primary' type='button'>Register</button></NavLink>
                </div>
            </section>
        );
    }
}

Main.propTypes = {
    user: PropTypes.object,
    sectors: PropTypes.array
};

export default connect()(Main);