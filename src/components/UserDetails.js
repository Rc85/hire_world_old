import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import '../styles/UserDetails.css';

class UserDetails extends Component {
    render() {
        return(
            <section id='user-details'>
                <div className='d-flex justify-content-between mb-2'>
                    <h6>About Yourself</h6>
                    
                    <button className='btn btn-info btn-sm'><FontAwesomeIcon icon={faEdit} /></button>
                </div>

                {this.props.userBio ? <div id='user-bio' className='rounded'>{this.props.userBio}</div> : ''}
            </section>
        )
    }
}

export default UserDetails;