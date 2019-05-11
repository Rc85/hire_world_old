import React from 'react';
import { NavLink } from 'react-router-dom';

const Footer = props => {
    return(
        <footer>
            <section id='footer'>
                <div className='footer-links'>
                    <div><NavLink to='/faq'>FAQ</NavLink></div>
                    <div><NavLink to='/tos'>Terms of Service</NavLink></div>
                    <div><NavLink to='/privacy'>Privacy Policy</NavLink></div>
                    {props.user.user ? <div><NavLink to='/refer'>Refer a Friend</NavLink></div> : ''}
                    <div><NavLink to='/about'>About</NavLink></div>
                </div>
    
                <div className='text-center'>Copyright © 2019 Hire World. All rights reserved.</div>
            </section>
        </footer>
    )
}

export default Footer;