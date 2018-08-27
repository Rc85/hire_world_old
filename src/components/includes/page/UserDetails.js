import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/UserDetails.css';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { EditUser } from '../../../actions/EditUserActions';
import Loading from '../../utils/Loading';

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
        this.props.dispatch(EditUser('user_bio', this.state.value, this.props.user))
    }

    render() {
        let editor;
        let icon;
        let bio;
        
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

        if (this.props.editStatus === 'edit user_bio loading') {
            bio = <Loading size='3x' />
        } else {
            bio = this.props.user.user_bio;
        }

        return(
            <section id='user-details'>
                <div className='d-flex justify-content-between mb-2'>
                    <h6>About</h6>
                    
                    <button className='btn btn-info btn-sm' onClick={this.openEditor.bind(this)}>{icon}</button>
                </div>

                {editor}

                {this.props.user.user_bio ? <div id='user-bio' className='grey-panel rounded mt-3'>{bio}</div> : ''}
            </section>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user,
        editStatus: state.Login.status
    }
}

export default withRouter(connect(mapStateToProps)(UserDetails));