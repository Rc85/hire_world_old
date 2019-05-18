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
        let code, header;
        let message = this.props.message;

        if (this.props.match.params.code) {
            if (this.props.match.params.code === '401') {
                code = 401;
                header = 'Unauthorized';
                message = `You're not authorized to access this page`;

                if (this.props.match.params.type === 'file') {
                    message = `You're not authorized to download that file`;
                }
            } else if (this.props.match.params.code === '403') {
                code = 403;
                header = 'Forbidden';
                message = `You're not allowed to access this page`;

                if (this.props.match.params.type === 'link_work') {
                    message = <React.Fragment>
                        <span>Your cannot access this page. Reasons may include:</span>
                        <ul className='w-75 mx-auto'>
                            <li className='text-left'>You're not subscribed to a Link Work plan.</li>
                            <li className='text-left'>If you had an account and are now seeing this page, your account has been rejected. Please contact our administrator for more details.</li>
                        </ul>
                    </React.Fragment>;
                }
            } else if (this.props.match.params.code === '404') {
                code = 404;
                
                if (this.props.match.params.type === 'app') {
                    header = 'Not Found';
                    message = `The page you're trying to access does not exist`;
                } else if (this.props.match.params.type === 'listing') {
                    header = 'Listing Not Found';
                    message = `The user does not have any active listings`;
                } else if (this.props.match.params.type === 'job') {
                    header = 'Job Not Found';
                    message = `The job in this stage does not exist. Check the other stages such as 'Active'`;
                }
            } else if (this.props.match.params.code === '500') {
                code = 500;
                header = 'Internal Server Error'
            }
        } else {
            header = this.props.header;
        }

        return(
            <div id='response' className='main-panel'>
                <div className='text-center'>
                    <h3 className='mb-2'>{code !== 200 ? code : ''} {header}</h3>

                    {this.props.children ? this.props.children : message}
                </div>
            </div>
        )
    }
}

Response.defaultProps = {
    code: 500,
    header: 'Unknown Error'
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