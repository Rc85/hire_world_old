import React from 'react';

const Footer = props => {
    return(
        <footer>
            <section id='footer'>
                <div className='footer-links mx-auto mb-2'>
                    <div><a href='/tos'>Terms of Service</a></div>
                    <div><a href='/privacy'>Privacy Policy</a></div>
                    <div><a href='/about'>About</a></div>
                    <div><a href='/contact'>Contact Us</a></div>
                </div>
    
                <div className='text-center'>Copyright © 2019 HireWorld. All rights reserved.</div>
            </section>
        </footer>
    )
}

export default Footer;