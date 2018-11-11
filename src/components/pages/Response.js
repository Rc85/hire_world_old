import React, { Component } from 'react';
import PropTypes from 'prop-types';

/* Response component is the component to direct to after a success form submission or going to a link that is not found */

/**
 * @param {Number} code The HTTP response code
 * @param {String} header A header/title of the response
 * @param {String} message The message regarding the response
 */
class Response extends Component {
    render() {
        return(
            <div className='response main-panel'>
                <div className='blue-panel shallow rounded text-center'>
                    <h3>{this.props.code !== 200 ? this.props.code : ''} {this.props.header}</h3>
    
                    {this.props.message}
                </div>
            </div>
        )
    }
}

Response.defaultProps = {
    header: 'Unknown Error',
    message: 'An unknown error has occurred. Please contact the administrator with your previous actions and/or the page you were on.'
}

Response.propTypes = {
    code: PropTypes.number,
    header: PropTypes.string,
    message: PropTypes.string
}

export default Response;