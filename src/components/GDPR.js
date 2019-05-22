import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

class GDPR extends Component {
    handleGdpr() {
        localStorage.setItem('gdpr', true);
        this.props.agree();
    }

    render() {
        return (
            <div id='gdpr-popup' className='floating-container'>
                <div className='mb-3'>By clicking on the "I agree" button or continuing to access Hire World's website and/or use any of Hire World's service(s), you hereby acknowledge that you understand and agreed with our <NavLink to='/privacy'>Privacy Policy</NavLink>.</div>

                <div className='text-right'><button className='btn btn-primary' onClick={this.handleGdpr.bind(this)}>I agree</button></div>
            </div>
        );
    }
}

GDPR.propTypes = {

};

export default GDPR;