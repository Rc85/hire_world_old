import React from 'react';

const Footer = props => {
    return(
        <section id='footer'>
            <div className='footer-links mx-auto mb-3'>
                <div><a href='/tos'>Terms of Service</a></div>
                <div><a href='/privacy'>Privacy Policy</a></div>
                <div><a href='/about'>About</a></div>
                <div><a href='/contact'>Contact Us</a></div>
            </div>

            <div className='text-center'>Copyright © 2018 M-ploy. All rights reserved.</div>
        </section>
    )
}

export default Footer;