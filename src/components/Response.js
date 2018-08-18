import React, { Component } from 'react';
import '../styles/Response.css';

/* Response component is the component to direct to after a success form submission or going to a link that is not found */

/**
 * @property {Number} code The HTTP response code
 * @property {String} header A header/title of the response
 * @property {String} message The message regarding the response
 */
class Response extends Component {
    render() {
        return(
            <div className='response'>
                <div className='blue-panel shallow rounded text-center'>
                    <h3>{this.props.code !== 200 ? this.props.code : ''} {this.props.header}</h3>
    
                    {this.props.message}
                </div>
            </div>
        )
    }
}

export default Response;