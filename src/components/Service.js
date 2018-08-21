import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

class Service extends Component {
    deleteService() {
        console.log(this.props.id);
    }

    render() {
        return(
            <div className='user-services-details mb-3 rounded'>
                <h5 className='d-flex justify-content-between'>
                    {this.props.name}
                    
                    <span className='delete-button' onClick={this.deleteService.bind(this)}><FontAwesomeIcon icon={faTimes} /></span>
                </h5>

                <span>{this.props.desc}</span>
            </div>
        )
    }
}

export default connect()(Service);