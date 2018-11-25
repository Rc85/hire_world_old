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

    openEditor() {
        this.setState({
            editor: !this.state.editor
        });
    }

    submitBio() {
        this.props.dispatch(EditUser('user_bio', this.state.value, this.props.user.user))
    }

    render() {
        let editor;
        let icon;
        let bio;
        
        if (this.props.user.user) {
            if (this.state.editor) {
                editor = <div id='user-bio-editor'>
                    <textarea className='form-control w-100' name='user-bio' rows={'6'}
                    onChange={(e) => {
                        this.setState({
                            value: e.target.value
                        });
                    }}
                    ></textarea>
                    <div className='text-right mt-1'><button className='btn btn-primary' onClick={() => {
                        this.submitBio();

                        document.getElementById('user-bio-editor').value = '';

                        this.setState({
                            editor: !this.state.editor
                        });
                    }}>Submit</button></div>
                </div>;
                icon = <FontAwesomeIcon icon={faTimes} />;
            } else {
                icon = <FontAwesomeIcon icon={faEdit} />
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
                    <h5>About</h5>
                    
                    <button className='btn btn-info btn-sm' onClick={this.openEditor.bind(this)}>{icon}</button>
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