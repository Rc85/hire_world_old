import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

/* Response component is the component to direct to after a success form submission or going to a link that is not found */

/**
 * @param {Number} code The HTTP response code
 * 400 Bad Request
 * 
 * 401 Unauthorized
 * 
 * 402 Payment Required
 * 
 * 403 Forbidden
 * 
 * 404 Not Found
 * 
 * 500 Internal Server Error
 * 
 * 502 Bad Gateway
 * 
 * 503 Service Unavailable
 * 
 * @param {String} header A header/title of the response
 * @param {String} message The message regarding the response
 */
class Response extends Component {
    render() {
        let code, header, message;

        if (this.props.match.params.code) {
            if (this.props.match.params.code === '404') {
                code = 404;
                header = 'Not Found';
                message = `The page you're trying to access does not exist`;
            } else if (this.props.match.params.code === '500') {
                code = 500;
                header = 'Internal Server Error';
                message = `An error occurred while trying to process your request`;
            }
        } else {
            code = this.props.code;
            header = this.props.header;
            message = this.props.message;
        }

        return(
            <div id='response' className='main-panel'>
                <div className='text-center'>
                    <h3 className='mb-2'>{code !== 200 ? code : ''} {header}</h3>
    
                    <div dangerouslySetInnerHTML={{__html: message}}></div>

                    {this.props.children ? this.props.children : ''}
                </div>
            </div>
        )
    }
}

Response.defaultProps = {
    code: 500,
    header: 'Unknown Error',
    message: 'An unknown error has occurred. Please contact the administrator with your previous actions and/or the page you were on.'
}

Response.propTypes = {
    code: PropTypes.number,
    header: PropTypes.string,
    message: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ])
}

export default withRouter(Response);