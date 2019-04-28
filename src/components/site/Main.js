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
                                <h1>Talent, job, service, or work</h1>
                                <span>We are aimed to provide services to assist you on growing your business</span>

                                <div className='text-right mt-2'><NavLink to='/register'><button type='button' className='btn btn-primary'>Get Started</button></NavLink></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='site-section-div-container'>
                    <div className='site-section-div'>
                        <div className='text-center mb-1'><FontAwesomeIcon icon={faSearchDollar} size='3x' className='text-highlight' /></div>
                        <div className='text-center mb-3'><h3>No Hidden Fees</h3></div>

                        <p>No VAT, processing fees, administration fees, refund fees, currency exchange fees, partial payment fees, or "we need more money" fees.</p>
                    </div>

                    <div className='site-section-div'>
                        <div className='text-center mb-1'><FontAwesomeIcon icon={faThumbsUp} size='3x' className='text-highlight' /></div>
                        <div className='text-center mb-3'><h3>Hassle-free</h3></div>

                        <p>No invoices, no billings, no paper work. Releasing funds is as easy as a click of a button.</p>
                    </div>

                    <div className='site-section-div'>
                        <div className='text-center mb-1'><FontAwesomeIcon icon={faShieldAlt} size='3x' className='text-highlight' /></div>
                        <div className='text-center mb-3'><h3>Secured</h3></div>

                        <p>Your funds are secured no matter where you are so you can focus primarily on your business.</p>
                    </div>
                </div>

                <div className='site-section'>
                    <div className='site-text'>
                        <h1>Freelancers</h1>

                        <p>Whether you're looking for work locally, remotely, or on Hire World, we have the services to help with your business from communications, payments, and file transfers.</p>
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
                        <h1>Contractors</h1>

                        <p>Create your profile and clients can find your profile in our profiles directory. The directory can be filter by a number of parameters such as price and location.</p>
                    </div>
                </div>

                <div className='site-section'>
                    <div className='site-text'>
                        <h1>Recruiters and Service Providers</h1>

                        <p>Recruiters can post jobs looking for specific talents for full-time, part-time, or even just for a project. Applying is never easier than one click of a button.</p>
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