import React, { Component } from 'react';
import '../styles/Browse.css';

class Browse extends Component {
    render() {
        return(
            <section id='browse' className='container'>
                <div className='row-container'>
                    <div className='section-container'>
                        <div className='section-header'>Artists</div>

                        <div className='section-body'>
                            <div>Painters</div>
                            <div>Musicians</div>
                            <div>Tattoo Artists</div>
                            <div>Makeup Artists</div>
                            <div>Hair Stylists</div>
                            <div>Performers</div>
                        </div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Agencies</div>

                        <div className='section-body'>
                            Real Estate Agents, Stock Brokers, Models, Actors/Actresses
                        </div>
                    </div>
                    
                    <div className='section-container'>
                        <div className='section-header'>Childcare</div>

                        <div className='section-body'>
                            Babysitters, Daycares, Nannies
                        </div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Consultants</div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Couriers</div>

                        <div className='section-body'>
                            Truck Drivers, Delivery Drivers
                        </div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Designers</div>

                        <div className='section-body'>
                            Graphic Designers, Interior Designers, Fashion Designers
                        </div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Developers</div>

                        <div className='section-body'>
                            Software Developers, Web Developers
                        </div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Events</div>

                        <div className='section-body'>
                            Wedding Planner, Tour Guides, Photographers, Hosts
                        </div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Health</div>

                        <div className='section-body'>
                            Nurses, Massage Therapists, Chiropractors, Physiologists
                        </div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Homecare</div>

                        <div className='section-body'>
                            Maid, Butlers, Home Renovators
                        </div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Labourers</div>

                        <div className='section-body'>
                            Electricians, Gardeners, Plumbers, Constructions
                        </div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Personal</div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Petcare</div>

                        <div className='section-body'>
                            Petsitters, Dog Walkers, Groomers
                        </div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Repairs</div>

                        <div className='section-body'>
                            Mechanics, Electronics, Appliances
                        </div>
                    </div>

                    <div className='section-container'>
                        <div className='section-header'>Trainers</div>

                        <div className='section-body'>
                            Tutors, Piano Teachers, Driving Instructors, Swimming Instructors, Personal Trainers, Dancing Instructors, Fitness Instructors
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default Browse;