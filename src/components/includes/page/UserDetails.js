import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { EditUser } from '../../../actions/EditUserActions';
import Loading from '../../utils/Loading';
import PropTypes from 'prop-types';

class UserDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editor: false,
            value: null
        }
    }

    submitBio() {
        this.props.dispatch(EditUser('user_bio', this.state.value, this.props.user.user));
        this.setState({editor: false});
    }

    render() {
        let editor, icon, bio;
        
        if (this.props.user.user) {
            if (this.state.editor) {
                editor = <div id='user-bio-editor'>
                    <textarea className='w-100' name='user-bio' rows='6'
                    onChange={(e) => this.setState({value: e.target.value})} placeholder='Write about yourself and what you do'></textarea>
                    <div className='text-right mt-1'>
                    <button className='btn btn-primary mr-1' onClick={() => this.submitBio()}>Submit</button>
                    <button className='btn btn-secondary' onClick={() => this.setState({editor: false})}>Cancel</button>
                    </div>
                </div>;
            } else {
                icon = <button className='btn btn-info btn-sm' onClick={() => this.setState({editor: !this.state.editor})}><FontAwesomeIcon icon={faEdit} /></button>
            }

            if (this.props.user.status === 'edit user_bio loading') {
                bio = <Loading size='3x' />
            } else {
                if (this.props.user.user.user_bio) {
                    bio = <div id='user-bio' className='grey-panel rounded mt-3'>{this.props.user.user.user_bio}</div>;
                }
            }
        }

        return(
            <section id='user-details'>
                <div className='d-flex justify-content-between mb-2'>
                    <h5>Details</h5>
                    
                    {icon}
                </div>

                {editor}

                {bio}
            </section>
        )
    }
}

UserDetails.propTypes = {
    user: PropTypes.object.isRequired
}

export default connect()(UserDetails);