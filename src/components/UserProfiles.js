import React, { Component } from 'react';
import '../styles/UserProfiles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

class UserProfiles extends Component {
    render() {
        return(
            <section id='user-services'>
                <div className='d-flex justify-content-between mb-2'>
                    <h6>Profiles</h6>

                    <button className='btn btn-info btn-sm'><FontAwesomeIcon icon={faPlus} /></button>
                </div>

                {this.props.userServices ? <div id='user-services-details' class='rounded'>{this.props.userServices}</div> : ''}
            </section>
        )
    }
}

export default UserProfiles;